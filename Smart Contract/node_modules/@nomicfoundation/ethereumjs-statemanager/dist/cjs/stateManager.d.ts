import { Common } from '@nomicfoundation/ethereumjs-common';
import { Trie } from '@nomicfoundation/ethereumjs-trie';
import { Account, Address } from '@nomicfoundation/ethereumjs-util';
import { AccountCache, CacheType, CodeCache, StorageCache } from './cache/index.js';
import { OriginalStorageCache } from './cache/originalStorageCache.js';
import type { AccountFields, EVMStateManagerInterface, StorageDump } from '@nomicfoundation/ethereumjs-common';
import type { StorageRange } from '@nomicfoundation/ethereumjs-common/src';
import type { DB, PrefixedHexString } from '@nomicfoundation/ethereumjs-util';
import type { Debugger } from 'debug';
export declare type StorageProof = {
    key: PrefixedHexString;
    proof: PrefixedHexString[];
    value: PrefixedHexString;
};
export declare type Proof = {
    address: PrefixedHexString;
    balance: PrefixedHexString;
    codeHash: PrefixedHexString;
    nonce: PrefixedHexString;
    storageHash: PrefixedHexString;
    accountProof: PrefixedHexString[];
    storageProof: StorageProof[];
};
declare type CacheOptions = {
    /**
     * Allows for cache deactivation
     *
     * Depending on the use case and underlying datastore (and eventual concurrent cache
     * mechanisms there), usage with or without cache can be faster
     *
     * Default: false
     */
    deactivate?: boolean;
    /**
     * Cache type to use.
     *
     * Available options:
     *
     * ORDERED_MAP: Cache with no fixed upper bound and dynamic allocation,
     * use for dynamic setups like testing or similar.
     *
     * LRU: LRU cache with pre-allocation of memory and a fixed size.
     * Use for larger and more persistent caches.
     */
    type?: CacheType;
    /**
     * Size of the cache (only for LRU cache)
     *
     * Default: 100000 (account cache) / 20000 (storage cache) / 20000 (code cache)
     *
     * Note: the cache/trie interplay mechanism is designed in a way that
     * the theoretical number of max modified accounts between two flush operations
     * should be smaller than the cache size, otherwise the cache will "forget" the
     * old modifications resulting in an incomplete set of trie-flushed accounts.
     */
    size?: number;
};
declare type CacheSettings = {
    deactivate: boolean;
    type: CacheType;
    size: number;
};
/**
 * Prefix to distinguish between a contract deployed with code `0x80`
 * and `RLP([])` (also having the value `0x80`).
 *
 * Otherwise the creation of the code hash for the `0x80` contract
 * will be the same as the hash of the empty trie which leads to
 * misbehaviour in the underlying trie library.
 */
export declare const CODEHASH_PREFIX: Uint8Array;
/**
 * Options for constructing a {@link StateManager}.
 */
export interface DefaultStateManagerOpts {
    /**
     * A {@link Trie} instance
     */
    trie?: Trie;
    /**
     * Option to prefix codehashes in the database. This defaults to `true`.
     * If this is disabled, note that it is possible to corrupt the trie, by deploying code
     * which code is equal to the preimage of a trie-node.
     * E.g. by putting the code `0x80` into the empty trie, will lead to a corrupted trie.
     */
    prefixCodeHashes?: boolean;
    /**
     * Option to prefix the keys for the storage tries with the first 7 bytes from the
     * associated account address. Activating this option gives a noticeable performance
     * boost for storage DB reads when operating on larger tries.
     *
     * Note: Activating/deactivating this option causes continued state reads to be
     * incompatible with existing databases.
     *
     * Default: false (for backwards compatibility reasons)
     */
    prefixStorageTrieKeys?: boolean;
    accountCacheOpts?: CacheOptions;
    storageCacheOpts?: CacheOptions;
    codeCacheOpts?: CacheOptions;
    /**
     * The common to use
     */
    common?: Common;
}
/**
 * Default StateManager implementation for the VM.
 *
 * The state manager abstracts from the underlying data store
 * by providing higher level access to accounts, contract code
 * and storage slots.
 *
 * The default state manager implementation uses a
 * `@ethereumjs/trie` trie as a data backend.
 */
export declare class DefaultStateManager implements EVMStateManagerInterface {
    protected _debug: Debugger;
    protected _accountCache?: AccountCache;
    protected _storageCache?: StorageCache;
    protected _codeCache?: CodeCache;
    originalStorageCache: OriginalStorageCache;
    protected _trie: Trie;
    protected _storageTries: {
        [key: string]: Trie;
    };
    protected readonly _prefixCodeHashes: boolean;
    protected readonly _prefixStorageTrieKeys: boolean;
    protected readonly _accountCacheSettings: CacheSettings;
    protected readonly _storageCacheSettings: CacheSettings;
    protected readonly _codeCacheSettings: CacheSettings;
    readonly common: Common;
    protected _checkpointCount: number;
    protected _proofTrie: Trie;
    private keccakFunction;
    /**
     * StateManager is run in DEBUG mode (default: false)
     * Taken from DEBUG environment variable
     *
     * Safeguards on debug() calls are added for
     * performance reasons to avoid string literal evaluation
     * @hidden
     */
    protected readonly DEBUG: boolean;
    /**
     * Instantiate the StateManager interface.
     */
    constructor(opts?: DefaultStateManagerOpts);
    /**
     * Gets the account associated with `address` or `undefined` if account does not exist
     * @param address - Address of the `account` to get
     */
    getAccount(address: Address): Promise<Account | undefined>;
    /**
     * Saves an account into state under the provided `address`.
     * @param address - Address under which to store `account`
     * @param account - The account to store or undefined if to be deleted
     */
    putAccount(address: Address, account: Account | undefined): Promise<void>;
    /**
     * Gets the account associated with `address`, modifies the given account
     * fields, then saves the account into state. Account fields can include
     * `nonce`, `balance`, `storageRoot`, and `codeHash`.
     * @param address - Address of the account to modify
     * @param accountFields - Object containing account fields and values to modify
     */
    modifyAccountFields(address: Address, accountFields: AccountFields): Promise<void>;
    /**
     * Deletes an account from state under the provided `address`.
     * @param address - Address of the account which should be deleted
     */
    deleteAccount(address: Address): Promise<void>;
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     */
    putContractCode(address: Address, value: Uint8Array): Promise<void>;
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @returns {Promise<Uint8Array>} -  Resolves with the code corresponding to the provided address.
     * Returns an empty `Uint8Array` if the account has no associated code.
     */
    getContractCode(address: Address): Promise<Uint8Array>;
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    protected _getStorageTrie(addressOrHash: Address | Uint8Array, account?: Account): Trie;
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    protected _getAccountTrie(): Trie;
    /**
     * Gets the storage trie for an account from the storage
     * cache or does a lookup.
     * @private
     */
    protected _getCodeDB(): DB;
    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Uint8Array` is returned.
     */
    getContractStorage(address: Address, key: Uint8Array): Promise<Uint8Array>;
    /**
     * Modifies the storage trie of an account.
     * @private
     * @param address -  Address of the account whose storage is to be modified
     * @param modifyTrie - Function to modify the storage trie of the account
     */
    protected _modifyContractStorage(address: Address, account: Account, modifyTrie: (storageTrie: Trie, done: Function) => void): Promise<void>;
    protected _writeContractStorage(address: Address, account: Account, key: Uint8Array, value: Uint8Array): Promise<void>;
    /**
     * Adds value to the state trie for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`.
     * Cannot be more than 32 bytes. Leading zeros are stripped.
     * If it is a empty or filled with zeros, deletes the value.
     */
    putContractStorage(address: Address, key: Uint8Array, value: Uint8Array): Promise<void>;
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address - Address to clear the storage of
     */
    clearContractStorage(address: Address): Promise<void>;
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     */
    checkpoint(): Promise<void>;
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     */
    commit(): Promise<void>;
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     */
    revert(): Promise<void>;
    /**
     * Writes all cache items to the trie
     */
    flush(): Promise<void>;
    /**
     * Get an EIP-1186 proof
     * @param address address to get proof of
     * @param storageSlots storage slots to get proof of
     */
    getProof(address: Address, storageSlots?: Uint8Array[]): Promise<Proof>;
    /**
     * Create a StateManager and initialize this with proof(s) gotten previously from getProof
     * This generates a (partial) StateManager where one can retrieve all items from the proof
     * @param proof Either a proof retrieved from `getProof`, or an array of those proofs
     * @param safe Wether or not to verify that the roots of the proof items match the reported roots
     * @param verifyRoot verify that all proof root nodes match statemanager's stateroot - should be
     * set to `false` when constructing a state manager where the underlying trie has proof nodes from different state roots
     * @returns A new DefaultStateManager with elements from the given proof included in its backing state trie
     */
    static fromProof(proof: Proof | Proof[], safe?: boolean, opts?: DefaultStateManagerOpts): Promise<DefaultStateManager>;
    /**
     * Adds a storage proof to the state manager
     * @param storageProof The storage proof
     * @param storageHash The root hash of the storage trie
     * @param address The address
     * @param safe Whether or not to verify if the reported roots match the current storage root
     */
    private addStorageProof;
    /**
     * Add proof(s) into an already existing trie
     * @param proof The proof(s) retrieved from `getProof`
     * @param verifyRoot verify that all proof root nodes match statemanager's stateroot - should be
     * set to `false` when constructing a state manager where the underlying trie has proof nodes from different state roots
     */
    addProofData(proof: Proof | Proof[], safe?: boolean): Promise<void>;
    /**
     * Verify an EIP-1186 proof. Throws if proof is invalid, otherwise returns true.
     * @param proof the proof to prove
     */
    verifyProof(proof: Proof): Promise<boolean>;
    /**
     * Gets the state-root of the Merkle-Patricia trie representation
     * of the state of this StateManager. Will error if there are uncommitted
     * checkpoints on the instance.
     * @returns {Promise<Uint8Array>} - Returns the state-root of the `StateManager`
     */
    getStateRoot(): Promise<Uint8Array>;
    /**
     * Sets the state of the instance to that represented
     * by the provided `stateRoot`. Will error if there are uncommitted
     * checkpoints on the instance or if the state root does not exist in
     * the state trie.
     * @param stateRoot - The state-root to reset the instance to
     */
    setStateRoot(stateRoot: Uint8Array, clearCache?: boolean): Promise<void>;
    /**
     * Dumps the RLP-encoded storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @returns {Promise<StorageDump>} - The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    dumpStorage(address: Address): Promise<StorageDump>;
    /**
     Dumps a limited number of RLP-encoded storage values for an account specified by `address`,
     starting from `startKey` or greater.
     @param address - The address of the `account` to return storage for.
     @param startKey - The bigint representation of the smallest storage key that will be returned.
     @param limit - The maximum number of storage values that will be returned.
     @returns {Promise<StorageRange>} - A {@link StorageRange} object that will contain at most `limit` entries in its `storage` field.
     The object will also contain `nextKey`, the next (hashed) storage key after the range included in `storage`.
     */
    dumpStorageRange(address: Address, startKey: bigint, limit: number): Promise<StorageRange>;
    /**
     * Initializes the provided genesis state into the state trie.
     * Will error if there are uncommitted checkpoints on the instance.
     * @param initState address -> balance | [balance, code, storage]
     */
    generateCanonicalGenesis(initState: any): Promise<void>;
    /**
     * Checks whether there is a state corresponding to a stateRoot
     */
    hasStateRoot(root: Uint8Array): Promise<boolean>;
    /**
     * Copies the current instance of the `StateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted.
     *
     * Caches are downleveled (so: adopted for short-term usage)
     * by default.
     *
     * This means in particular:
     * 1. For caches instantiated as an LRU cache type
     * the copy() method will instantiate with an ORDERED_MAP cache
     * instead, since copied instantances are mostly used in
     * short-term usage contexts and LRU cache instantation would create
     * a large overhead here.
     * 2. The underlying trie object is initialized with 0 cache size
     *
     * Both adoptions can be deactivated by setting `downlevelCaches` to
     * `false`.
     *
     * Cache values are generally not copied along regardless of the
     * `downlevelCaches` setting.
     */
    shallowCopy(downlevelCaches?: boolean): DefaultStateManager;
    /**
     * Clears all underlying caches
     */
    clearCaches(): void;
}
export {};
//# sourceMappingURL=stateManager.d.ts.map