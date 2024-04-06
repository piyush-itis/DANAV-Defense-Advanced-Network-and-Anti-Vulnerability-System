import { Account } from '@nomicfoundation/ethereumjs-util';
import { AccountCache, CacheType, StorageCache } from './cache/index.js';
import { OriginalStorageCache } from './cache/originalStorageCache.js';
import type { DefaultStateManager } from './stateManager.js';
import type { VerkleExecutionWitness } from '@nomicfoundation/ethereumjs-block';
import type { AccountFields, Common, EVMStateManagerInterface, Proof, StorageDump, StorageRange } from '@nomicfoundation/ethereumjs-common';
import type { Address, PrefixedHexString } from '@nomicfoundation/ethereumjs-util';
export interface VerkleState {
    [key: PrefixedHexString]: PrefixedHexString;
}
export interface EncodedVerkleProof {
    [key: PrefixedHexString]: PrefixedHexString;
}
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
     * Default: 100000 (account cache) / 20000 (storage cache)
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
 * Options dictionary.
 */
export interface StatelessVerkleStateManagerOpts {
    accountCacheOpts?: CacheOptions;
    /**
     * The common to use
     */
    common?: Common;
    storageCacheOpts?: CacheOptions;
}
/**
 * Stateless Verkle StateManager implementation for the VM.
 *
 * Experimental.
 *
 * This State Manager enables stateless block execution by building a
 * temporary (1-block) state from the verkle block witness.
 * The Stateless Verkle State Manager then uses that populated state
 * to fetch data requested by the the VM.
 *
 */
export declare class StatelessVerkleStateManager implements EVMStateManagerInterface {
    _accountCache?: AccountCache;
    _storageCache?: StorageCache;
    _codeCache: {
        [key: string]: Uint8Array;
    };
    originalStorageCache: OriginalStorageCache;
    protected readonly _accountCacheSettings: CacheSettings;
    protected readonly _storageCacheSettings: CacheSettings;
    /**
     * StateManager is run in DEBUG mode (default: false)
     * Taken from DEBUG environment variable
     *
     * Safeguards on debug() calls are added for
     * performance reasons to avoid string literal evaluation
     * @hidden
     */
    protected readonly DEBUG: boolean;
    private _executionWitness?;
    private _proof;
    private _state;
    private _postState;
    private _checkpoints;
    private keccakFunction;
    /**
     * Instantiate the StateManager interface.
     */
    constructor(opts?: StatelessVerkleStateManagerOpts);
    getTransitionStateRoot(_: DefaultStateManager, __: Uint8Array): Promise<Uint8Array>;
    initVerkleExecutionWitness(executionWitness?: VerkleExecutionWitness | null): void;
    getTreeKeyForVersion(stem: Uint8Array): Uint8Array;
    getTreeKeyForBalance(stem: Uint8Array): Uint8Array;
    getTreeKeyForNonce(stem: Uint8Array): Uint8Array;
    getTreeKeyForCodeHash(stem: Uint8Array): Uint8Array;
    getTreeKeyForCodeSize(stem: Uint8Array): Uint8Array;
    getTreeKeyForCodeChunk(address: Address, chunkId: number): Uint8Array;
    chunkifyCode(code: Uint8Array): void;
    getTreeKeyForStorageSlot(address: Address, storageKey: number): Uint8Array;
    /**
     * Copies the current instance of the `StateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted.
     */
    shallowCopy(): EVMStateManagerInterface;
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
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns {Promise<Uint8Array>} - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Uint8Array` is returned.
     */
    getContractStorage(address: Address, key: Uint8Array): Promise<Uint8Array>;
    /**
     * Adds value to the state for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`. Cannot be more than 32 bytes. Leading zeros are stripped. If it is a empty or filled with zeros, deletes the value.
     */
    putContractStorage(address: Address, key: Uint8Array, value: Uint8Array): Promise<void>;
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address -  Address to clear the storage of
     */
    clearContractStorage(address: Address): Promise<void>;
    getAccount(address: Address): Promise<Account>;
    putAccount(address: Address, account: Account): Promise<void>;
    /**
     * Deletes an account from state under the provided `address`.
     * @param address - Address of the account which should be deleted
     */
    deleteAccount(address: Address): Promise<void>;
    modifyAccountFields(address: Address, accountFields: AccountFields): Promise<void>;
    getProof(_: Address, __?: Uint8Array[]): Promise<Proof>;
    verifyProof(parentVerkleRoot: Uint8Array): Promise<boolean>;
    verifyPostState(): boolean;
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
    hasStateRoot(_: Uint8Array): Promise<boolean>;
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
     * Gets the verkle root.
     * NOTE: this needs some examination in the code where this is needed
     * and if we have the verkle root present
     * @returns {Promise<Uint8Array>} - Returns the verkle root of the `StateManager`
     */
    getStateRoot(): Promise<Uint8Array>;
    /**
     * TODO: needed?
     * Maybe in this context: reset to original pre state suffice
     * @param stateRoot - The verkle root to reset the instance to
     */
    setStateRoot(_: Uint8Array): Promise<void>;
    /**
     * Dumps the RLP-encoded storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @returns {Promise<StorageDump>} - The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    dumpStorage(_: Address): Promise<StorageDump>;
    dumpStorageRange(_: Address, __: bigint, ___: number): Promise<StorageRange>;
    /**
     * Clears all underlying caches
     */
    clearCaches(): void;
    generateCanonicalGenesis(_initState: any): Promise<void>;
}
export {};
//# sourceMappingURL=statelessVerkleStateManager.d.ts.map