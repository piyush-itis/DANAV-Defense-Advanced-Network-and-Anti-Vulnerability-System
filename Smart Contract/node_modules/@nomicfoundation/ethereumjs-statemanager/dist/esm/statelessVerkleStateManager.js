import { Account, KECCAK256_NULL_S, bigIntToBytes, bytesToBigInt, bytesToHex, bytesToInt32, concatBytes, equalsBytes, hexToBytes, padToEven, setLengthRight, short, toBytes, zeros, } from '@nomicfoundation/ethereumjs-util';
import { getKey, getStem, verifyUpdate } from '@nomicfoundation/ethereumjs-verkle';
import debugDefault from 'debug';
import { keccak256 as bufferKeccak256 } from 'ethereum-cryptography/keccak.js';
import { AccountCache, CacheType, StorageCache } from './cache/index.js';
import { OriginalStorageCache } from './cache/originalStorageCache.js';
function keccak256(msg) {
    return new Uint8Array(bufferKeccak256(Buffer.from(msg)));
}
const { debug: createDebugLogger } = debugDefault;
const debug = createDebugLogger('statemanager:verkle');
/**
 * Tree key constants.
 */
const VERSION_LEAF_KEY = toBytes(0);
const BALANCE_LEAF_KEY = toBytes(1);
const NONCE_LEAF_KEY = toBytes(2);
const CODE_KECCAK_LEAF_KEY = toBytes(3);
const CODE_SIZE_LEAF_KEY = toBytes(4);
const HEADER_STORAGE_OFFSET = 64;
const CODE_OFFSET = 128;
const VERKLE_NODE_WIDTH = 256;
const MAIN_STORAGE_OFFSET = 256 ** 31;
const PUSH_OFFSET = 95;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PUSH1 = PUSH_OFFSET + 1;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PUSH32 = PUSH_OFFSET + 32;
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
export class StatelessVerkleStateManager {
    /**
     * Instantiate the StateManager interface.
     */
    constructor(opts = {}) {
        /**
         * StateManager is run in DEBUG mode (default: false)
         * Taken from DEBUG environment variable
         *
         * Safeguards on debug() calls are added for
         * performance reasons to avoid string literal evaluation
         * @hidden
         */
        this.DEBUG = false;
        // State along execution (should update)
        this._state = {};
        // Post-state provided from the executionWitness.
        // Should not update. Used for comparing our computed post-state with the canonical one.
        this._postState = {};
        // Checkpointing
        this._checkpoints = [];
        this._accountCacheSettings = {
            deactivate: opts.accountCacheOpts?.deactivate ?? false,
            type: opts.accountCacheOpts?.type ?? CacheType.ORDERED_MAP,
            size: opts.accountCacheOpts?.size ?? 100000,
        };
        if (!this._accountCacheSettings.deactivate) {
            this._accountCache = new AccountCache({
                size: this._accountCacheSettings.size,
                type: this._accountCacheSettings.type,
            });
        }
        this._storageCacheSettings = {
            deactivate: opts.storageCacheOpts?.deactivate ?? false,
            type: opts.storageCacheOpts?.type ?? CacheType.ORDERED_MAP,
            size: opts.storageCacheOpts?.size ?? 20000,
        };
        if (!this._storageCacheSettings.deactivate) {
            this._storageCache = new StorageCache({
                size: this._storageCacheSettings.size,
                type: this._storageCacheSettings.type,
            });
        }
        this.originalStorageCache = new OriginalStorageCache(this.getContractStorage.bind(this));
        this._codeCache = {};
        this.keccakFunction = opts.common?.customCrypto.keccak256 ?? keccak256;
        // Skip DEBUG calls unless 'ethjs' included in environmental DEBUG variables
        // Additional window check is to prevent vite browser bundling (and potentially other) to break
        this.DEBUG =
            typeof window === 'undefined' ? process?.env?.DEBUG?.includes('ethjs') ?? false : false;
        /*
         * For a custom StateManager implementation adopt these
         * callbacks passed to the `Cache` instantiated to perform
         * the `get`, `put` and `delete` operations with the
         * desired backend.
         */
        // const getCb: get = async (address) => {
        //   return undefined
        // }
        // const putCb: put = async (keyBuf, accountRlp) => {}
        // const deleteCb = async (keyBuf: Uint8Array) => {}
        // this._cache = new Cache({ get, putCb, deleteCb })
    }
    async getTransitionStateRoot(_, __) {
        throw Error('not implemented');
    }
    initVerkleExecutionWitness(executionWitness) {
        if (executionWitness === null || executionWitness === undefined) {
            throw Error(`Invalid executionWitness=${executionWitness} for initVerkleExecutionWitness`);
        }
        this._executionWitness = executionWitness;
        this._proof = executionWitness.verkleProof;
        // Populate the pre-state and post-state from the executionWitness
        const preStateRaw = executionWitness.stateDiff.flatMap(({ stem, suffixDiffs }) => {
            const suffixDiffPairs = suffixDiffs.map(({ currentValue, suffix }) => {
                const key = `${stem}${padToEven(suffix.toString(16))}`;
                // TODO: Evaluate if we should store and handle null in a special way
                // Currently we are replacing `null` with 0x00..00 (32 bytes) [expect for codeHash, suffix 3, where we use the empty codeHash] for simplifying handling and comparisons
                // Also, test data has been inconsistent in this regard, so this simplifies things while things get more standardized
                if (Number(suffix) === 3) {
                    return { [key]: currentValue ?? KECCAK256_NULL_S };
                }
                return {
                    [key]: currentValue ?? bytesToHex(zeros(32)),
                };
            });
            return suffixDiffPairs;
        });
        const preState = preStateRaw.reduce((prevValue, currentValue) => {
            const acc = { ...prevValue, ...currentValue };
            return acc;
        }, {});
        this._state = preState;
        const postStateRaw = executionWitness.stateDiff.flatMap(({ stem, suffixDiffs }) => {
            const suffixDiffPairs = suffixDiffs.map(({ newValue, suffix }) => {
                const key = `${stem}${padToEven(suffix.toString(16))}`;
                // A postState value of null means there was no change from the preState.
                // In this implementation, we therefore replace null with the preState.
                const value = newValue ?? this._state[key];
                return {
                    [key]: value,
                };
            });
            return suffixDiffPairs;
        });
        const postState = postStateRaw.reduce((prevValue, currentValue) => {
            const acc = { ...prevValue, ...currentValue };
            return acc;
        }, {});
        this._postState = postState;
        debug('initVerkleExecutionWitness preState', this._state);
        debug('initVerkleExecutionWitness postState', this._postState);
    }
    getTreeKeyForVersion(stem) {
        return getKey(stem, VERSION_LEAF_KEY);
    }
    getTreeKeyForBalance(stem) {
        return getKey(stem, BALANCE_LEAF_KEY);
    }
    getTreeKeyForNonce(stem) {
        return getKey(stem, NONCE_LEAF_KEY);
    }
    getTreeKeyForCodeHash(stem) {
        return getKey(stem, CODE_KECCAK_LEAF_KEY);
    }
    getTreeKeyForCodeSize(stem) {
        return getKey(stem, CODE_SIZE_LEAF_KEY);
    }
    getTreeKeyForCodeChunk(address, chunkId) {
        return getKey(getStem(address, Math.floor((CODE_OFFSET + chunkId) / VERKLE_NODE_WIDTH)), toBytes((CODE_OFFSET + chunkId) % VERKLE_NODE_WIDTH));
    }
    chunkifyCode(code) {
        // Pad code to multiple of 31 bytes
        if (code.length % 31 !== 0) {
            const paddingLength = 31 - (code.length % 31);
            code = setLengthRight(code, code.length + paddingLength);
        }
        throw new Error('Not implemented');
    }
    getTreeKeyForStorageSlot(address, storageKey) {
        let position;
        if (storageKey < CODE_OFFSET - HEADER_STORAGE_OFFSET) {
            position = HEADER_STORAGE_OFFSET + storageKey;
        }
        else {
            position = MAIN_STORAGE_OFFSET + storageKey;
        }
        return getKey(getStem(address, Math.floor(position / VERKLE_NODE_WIDTH)), toBytes(position % VERKLE_NODE_WIDTH));
    }
    /**
     * Copies the current instance of the `StateManager`
     * at the last fully committed point, i.e. as if all current
     * checkpoints were reverted.
     */
    shallowCopy() {
        const stateManager = new StatelessVerkleStateManager();
        stateManager.initVerkleExecutionWitness(this._executionWitness);
        return stateManager;
    }
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     */
    async putContractCode(address, value) {
        const stem = getStem(address, 0);
        const codeHashKey = this.getTreeKeyForCodeHash(stem);
        const codeHash = bytesToHex(this.keccakFunction(value));
        this._state[bytesToHex(codeHashKey)] = codeHash;
        if (this.DEBUG) {
            debug(`putContractCode address=${address.toString()} value=${short(value)}`);
        }
        if (KECCAK256_NULL_S === codeHash) {
            // If the code hash is the null hash, no code has to be stored
            return;
        }
        // TODO: Slice the code into chunks and add them to the state
        throw new Error('Not implemented');
    }
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @returns {Promise<Uint8Array>} -  Resolves with the code corresponding to the provided address.
     * Returns an empty `Uint8Array` if the account has no associated code.
     */
    async getContractCode(address) {
        if (this.DEBUG) {
            debug(`getContractCode address=${address.toString()}`);
        }
        // Get the contract code size
        const codeSizeKey = this.getTreeKeyForCodeSize(getStem(address, 0));
        const codeSizeLE = hexToBytes(this._state[bytesToHex(codeSizeKey)] ?? '0x');
        // Calculate number of chunks
        const chunks = Math.ceil(bytesToInt32(codeSizeLE, true) / 32);
        const retrievedChunks = [];
        // Retrieve all code chunks
        for (let chunkId = 0; chunkId < chunks; chunkId++) {
            retrievedChunks.push(this.getTreeKeyForCodeChunk(address, chunkId));
        }
        // Aggregate code chunks
        const code = concatBytes(...retrievedChunks);
        // Return code chunks
        return code;
    }
    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns {Promise<Uint8Array>} - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Uint8Array` is returned.
     */
    async getContractStorage(address, key) {
        const storageKey = this.getTreeKeyForStorageSlot(address, Number(bytesToHex(key)));
        const storage = toBytes(this._state[bytesToHex(storageKey)]);
        return storage;
    }
    /**
     * Adds value to the state for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address -  Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`. Cannot be more than 32 bytes. Leading zeros are stripped. If it is a empty or filled with zeros, deletes the value.
     */
    async putContractStorage(address, key, value) {
        const storageKey = this.getTreeKeyForStorageSlot(address, Number(bytesToHex(key)));
        this._state[bytesToHex(storageKey)] = bytesToHex(value);
    }
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address -  Address to clear the storage of
     */
    async clearContractStorage(address) {
        const stem = getStem(address, 0);
        const codeHashKey = this.getTreeKeyForCodeHash(stem);
        // Update codeHash to `c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470`
        this._state[bytesToHex(codeHashKey)] = KECCAK256_NULL_S;
        // TODO: Clear all storage slots (how?)
    }
    async getAccount(address) {
        const stem = getStem(address, 0);
        const balanceKey = this.getTreeKeyForBalance(stem);
        const nonceKey = this.getTreeKeyForNonce(stem);
        const codeHashKey = this.getTreeKeyForCodeHash(stem);
        const balanceRaw = this._state[bytesToHex(balanceKey)];
        const nonceRaw = this._state[bytesToHex(nonceKey)];
        const codeHash = this._state[bytesToHex(codeHashKey)];
        const account = Account.fromAccountData({
            balance: typeof balanceRaw === 'string' ? bytesToBigInt(hexToBytes(balanceRaw), true) : undefined,
            nonce: typeof nonceRaw === 'string' ? bytesToBigInt(hexToBytes(nonceRaw), true) : undefined,
            codeHash,
        });
        if (this.DEBUG) {
            debug(`getAccount address=${address.toString()} stem=${short(stem)} balance=${account.balance} nonce=${account.nonce} codeHash=${short(account.codeHash)} storageHash=${short(account.storageRoot)}`);
        }
        return account;
    }
    async putAccount(address, account) {
        const stem = getStem(address, 0);
        const balanceKey = this.getTreeKeyForBalance(stem);
        const nonceKey = this.getTreeKeyForNonce(stem);
        const codeHashKey = this.getTreeKeyForCodeHash(stem);
        const balanceBuf = setLengthRight(bigIntToBytes(account.balance, true), 32);
        const nonceBuf = setLengthRight(bigIntToBytes(account.nonce, true), 32);
        this._state[bytesToHex(balanceKey)] = bytesToHex(balanceBuf);
        this._state[bytesToHex(nonceKey)] = bytesToHex(nonceBuf);
        this._state[bytesToHex(codeHashKey)] = bytesToHex(account.codeHash);
        if (this.DEBUG) {
            debug(`putAccount address=${address.toString()} stem=${short(stem)} balance=${account.balance} nonce=${account.nonce} codeHash=${short(account.codeHash)} storageHash=${short(account.storageRoot)}`);
        }
    }
    /**
     * Deletes an account from state under the provided `address`.
     * @param address - Address of the account which should be deleted
     */
    async deleteAccount(address) {
        this._accountCache.del(address);
        if (!this._storageCacheSettings.deactivate) {
            this._storageCache?.clearContractStorage(address);
        }
    }
    async modifyAccountFields(address, accountFields) {
        const account = await this.getAccount(address);
        account.nonce = accountFields.nonce ?? account.nonce;
        account.balance = accountFields.balance ?? account.balance;
        account.storageRoot = accountFields.storageRoot ?? account.storageRoot;
        account.codeHash = accountFields.codeHash ?? account.codeHash;
        await this.putAccount(address, account);
    }
    getProof(_, __ = []) {
        throw new Error('Not implemented yet');
    }
    async verifyProof(parentVerkleRoot) {
        // Implementation: https://github.com/crate-crypto/rust-verkle-wasm/blob/master/src/lib.rs#L45
        // The root is the root of the current (un-updated) trie
        // The proof is proof of membership of all of the accessed values
        // keys_values is a map from the key of the accessed value to a tuple
        // the tuple contains the old value and the updated value
        //
        // This function returns the new root when all of the updated values are applied
        const updatedStateRoot = verifyUpdate(parentVerkleRoot, this._proof, // TODO: Convert this into a Uint8Array ingestible by the method
        new Map() // TODO: Generate the keys_values map from the old to the updated value
        );
        // TODO: Not sure if this should return the updated state Root (current block) or the un-updated one (parent block)
        const verkleRoot = await this.getStateRoot();
        // Verify that updatedStateRoot matches the state root of the block
        return equalsBytes(updatedStateRoot, verkleRoot);
    }
    // Verifies that the witness post-state matches the computed post-state
    verifyPostState() {
        for (const [key, canonicalValue] of Object.entries(this._postState)) {
            const computedValue = this._state[key];
            if (canonicalValue !== computedValue) {
                debug(`verifyPostState failed for key ${key}. Canonical value: ${canonicalValue}, computed value: ${computedValue}`);
                return false;
            }
        }
        return true;
    }
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     */
    async checkpoint() {
        this._checkpoints.push(this._state);
        this._accountCache?.checkpoint();
        this._storageCache?.checkpoint();
    }
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     */
    async commit() {
        this._checkpoints.pop();
        this._accountCache.commit();
    }
    // TODO
    async hasStateRoot(_) {
        return true;
    }
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     */
    async revert() {
        // setup trie checkpointing
        this._accountCache?.revert();
        this._storageCache?.revert();
        this._codeCache = {};
    }
    /**
     * Writes all cache items to the trie
     */
    async flush() { }
    /**
     * Gets the verkle root.
     * NOTE: this needs some examination in the code where this is needed
     * and if we have the verkle root present
     * @returns {Promise<Uint8Array>} - Returns the verkle root of the `StateManager`
     */
    async getStateRoot() {
        return new Uint8Array(0);
    }
    /**
     * TODO: needed?
     * Maybe in this context: reset to original pre state suffice
     * @param stateRoot - The verkle root to reset the instance to
     */
    async setStateRoot(_) { }
    /**
     * Dumps the RLP-encoded storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @returns {Promise<StorageDump>} - The state of the account as an `Object` map.
     * Keys are are the storage keys, values are the storage values as strings.
     * Both are represented as hex strings without the `0x` prefix.
     */
    async dumpStorage(_) {
        throw Error('not implemented');
    }
    dumpStorageRange(_, __, ___) {
        throw Error('not implemented');
    }
    /**
     * Clears all underlying caches
     */
    clearCaches() {
        this._accountCache?.clear();
        this._storageCache?.clear();
    }
    generateCanonicalGenesis(_initState) {
        return Promise.resolve();
    }
}
//# sourceMappingURL=statelessVerkleStateManager.js.map