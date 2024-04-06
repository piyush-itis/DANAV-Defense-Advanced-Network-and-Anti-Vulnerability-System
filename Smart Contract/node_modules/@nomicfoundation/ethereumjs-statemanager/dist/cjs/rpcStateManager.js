"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPCBlockChain = exports.RPCStateManager = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_trie_1 = require("@nomicfoundation/ethereumjs-trie");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const debug_1 = require("debug");
const keccak_js_1 = require("ethereum-cryptography/keccak.js");
const index_js_1 = require("./cache/index.js");
const { debug: createDebugLogger } = debug_1.default;
function keccak256(msg) {
    return new Uint8Array((0, keccak_js_1.keccak256)(Buffer.from(msg)));
}
class RPCStateManager {
    constructor(opts) {
        /**
         * @deprecated This method is not used by the RPC State Manager and is a stub required by the State Manager interface
         */
        this.getStateRoot = async () => {
            return new Uint8Array(32);
        };
        /**
         * @deprecated This method is not used by the RPC State Manager and is a stub required by the State Manager interface
         */
        this.setStateRoot = async (_root) => { };
        /**
         * @deprecated This method is not used by the RPC State Manager and is a stub required by the State Manager interface
         */
        this.hasStateRoot = () => {
            throw new Error('function not implemented');
        };
        // Skip DEBUG calls unless 'ethjs' included in environmental DEBUG variables
        // Additional window check is to prevent vite browser bundling (and potentially other) to break
        this.DEBUG =
            typeof window === 'undefined' ? process?.env?.DEBUG?.includes('ethjs') ?? false : false;
        this._debug = createDebugLogger('statemanager:rpcStateManager');
        if (typeof opts.provider === 'string' && opts.provider.startsWith('http')) {
            this._provider = opts.provider;
        }
        else {
            throw new Error(`valid RPC provider url required; got ${opts.provider}`);
        }
        this._blockTag = opts.blockTag === 'earliest' ? opts.blockTag : (0, ethereumjs_util_1.bigIntToHex)(opts.blockTag);
        this._contractCache = new Map();
        this._storageCache = new index_js_1.StorageCache({ size: 100000, type: index_js_1.CacheType.ORDERED_MAP });
        this._accountCache = new index_js_1.AccountCache({ size: 100000, type: index_js_1.CacheType.ORDERED_MAP });
        this.originalStorageCache = new index_js_1.OriginalStorageCache(this.getContractStorage.bind(this));
        this.common = opts.common ?? new ethereumjs_common_1.Common({ chain: ethereumjs_common_1.Chain.Mainnet });
        this.keccakFunction = opts.common?.customCrypto.keccak256 ?? keccak256;
    }
    /**
     * Note that the returned statemanager will share the same JsonRpcProvider as the original
     *
     * @returns RPCStateManager
     */
    shallowCopy() {
        const newState = new RPCStateManager({
            provider: this._provider,
            blockTag: BigInt(this._blockTag),
        });
        newState._contractCache = new Map(this._contractCache);
        newState._storageCache = new index_js_1.StorageCache({
            size: 100000,
            type: index_js_1.CacheType.ORDERED_MAP,
        });
        newState._accountCache = new index_js_1.AccountCache({
            size: 100000,
            type: index_js_1.CacheType.ORDERED_MAP,
        });
        return newState;
    }
    /**
     * Sets the new block tag used when querying the provider and clears the
     * internal cache.
     * @param blockTag - the new block tag to use when querying the provider
     */
    setBlockTag(blockTag) {
        this._blockTag = blockTag === 'earliest' ? blockTag : (0, ethereumjs_util_1.bigIntToHex)(blockTag);
        this.clearCaches();
        if (this.DEBUG)
            this._debug(`setting block tag to ${this._blockTag}`);
    }
    /**
     * Clears the internal cache so all accounts, contract code, and storage slots will
     * initially be retrieved from the provider
     */
    clearCaches() {
        this._contractCache.clear();
        this._storageCache.clear();
        this._accountCache.clear();
    }
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @returns {Promise<Uint8Array>} - Resolves with the code corresponding to the provided address.
     * Returns an empty `Uint8Array` if the account has no associated code.
     */
    async getContractCode(address) {
        let codeBytes = this._contractCache.get(address.toString());
        if (codeBytes !== undefined)
            return codeBytes;
        const code = await (0, ethereumjs_util_1.fetchFromProvider)(this._provider, {
            method: 'eth_getCode',
            params: [address.toString(), this._blockTag],
        });
        codeBytes = (0, ethereumjs_util_1.toBytes)(code);
        this._contractCache.set(address.toString(), codeBytes);
        return codeBytes;
    }
    /**
     * Adds `value` to the state trie as code, and sets `codeHash` on the account
     * corresponding to `address` to reference this.
     * @param address - Address of the `account` to add the `code` for
     * @param value - The value of the `code`
     */
    async putContractCode(address, value) {
        // Store contract code in the cache
        this._contractCache.set(address.toString(), value);
    }
    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address - Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns {Uint8Array} - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Uint8Array` is returned.
     */
    async getContractStorage(address, key) {
        // Check storage slot in cache
        if (key.length !== 32) {
            throw new Error('Storage key must be 32 bytes long');
        }
        let value = this._storageCache.get(address, key);
        if (value !== undefined) {
            return value;
        }
        // Retrieve storage slot from provider if not found in cache
        const storage = await (0, ethereumjs_util_1.fetchFromProvider)(this._provider, {
            method: 'eth_getStorageAt',
            params: [address.toString(), (0, ethereumjs_util_1.bytesToHex)(key), this._blockTag],
        });
        value = (0, ethereumjs_util_1.toBytes)(storage);
        await this.putContractStorage(address, key, value);
        return value;
    }
    /**
     * Adds value to the cache for the `account`
     * corresponding to `address` at the provided `key`.
     * @param address - Address to set a storage value for
     * @param key - Key to set the value at. Must be 32 bytes long.
     * @param value - Value to set at `key` for account corresponding to `address`.
     * Cannot be more than 32 bytes. Leading zeros are stripped.
     * If it is empty or filled with zeros, deletes the value.
     */
    async putContractStorage(address, key, value) {
        this._storageCache.put(address, key, value);
    }
    /**
     * Clears all storage entries for the account corresponding to `address`.
     * @param address - Address to clear the storage of
     */
    async clearContractStorage(address) {
        this._storageCache.clearContractStorage(address);
    }
    /**
     * Dumps the RLP-encoded storage values for an `account` specified by `address`.
     * @param address - The address of the `account` to return storage for
     * @returns {Promise<StorageDump>} - The state of the account as an `Object` map.
     * Keys are the storage keys, values are the storage values as strings.
     * Both are represented as `0x` prefixed hex strings.
     */
    dumpStorage(address) {
        const storageMap = this._storageCache.dump(address);
        const dump = {};
        if (storageMap !== undefined) {
            for (const slot of storageMap) {
                dump[slot[0]] = (0, ethereumjs_util_1.bytesToHex)(slot[1]);
            }
        }
        return Promise.resolve(dump);
    }
    dumpStorageRange(_address, _startKey, _limit) {
        // TODO: Implement.
        return Promise.reject();
    }
    /**
     * Checks if an `account` exists at `address`
     * @param address - Address of the `account` to check
     */
    async accountExists(address) {
        if (this.DEBUG)
            this._debug?.(`verify if ${address.toString()} exists`);
        const localAccount = this._accountCache.get(address);
        if (localAccount !== undefined)
            return true;
        // Get merkle proof for `address` from provider
        const proof = await (0, ethereumjs_util_1.fetchFromProvider)(this._provider, {
            method: 'eth_getProof',
            params: [address.toString(), [], this._blockTag],
        });
        const proofBuf = proof.accountProof.map((proofNode) => (0, ethereumjs_util_1.toBytes)(proofNode));
        const trie = new ethereumjs_trie_1.Trie({ useKeyHashing: true, common: this.common });
        const verified = await trie.verifyProof(this.keccakFunction(proofBuf[0]), address.bytes, proofBuf);
        // if not verified (i.e. verifyProof returns null), account does not exist
        return verified === null ? false : true;
    }
    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `account` for
     * @returns {Promise<Uint8Array>} - Resolves with the code corresponding to the provided address.
     * Returns an empty `Uint8Array` if the account has no associated code.
     */
    async getAccount(address) {
        const elem = this._accountCache?.get(address);
        if (elem !== undefined) {
            return elem.accountRLP !== undefined
                ? ethereumjs_util_1.Account.fromRlpSerializedAccount(elem.accountRLP)
                : undefined;
        }
        const rlp = (await this.getAccountFromProvider(address)).serialize();
        const account = rlp !== null ? ethereumjs_util_1.Account.fromRlpSerializedAccount(rlp) : undefined;
        this._accountCache?.put(address, account);
        return account;
    }
    /**
     * Retrieves an account from the provider and stores in the local trie
     * @param address Address of account to be retrieved from provider
     * @private
     */
    async getAccountFromProvider(address) {
        if (this.DEBUG)
            this._debug(`retrieving account data from ${address.toString()} from provider`);
        const accountData = await (0, ethereumjs_util_1.fetchFromProvider)(this._provider, {
            method: 'eth_getProof',
            params: [address.toString(), [], this._blockTag],
        });
        const account = ethereumjs_util_1.Account.fromAccountData({
            balance: BigInt(accountData.balance),
            nonce: BigInt(accountData.nonce),
            codeHash: (0, ethereumjs_util_1.toBytes)(accountData.codeHash),
            storageRoot: (0, ethereumjs_util_1.toBytes)(accountData.storageHash),
        });
        return account;
    }
    /**
     * Saves an account into state under the provided `address`.
     * @param address - Address under which to store `account`
     * @param account - The account to store
     */
    async putAccount(address, account) {
        if (this.DEBUG) {
            this._debug(`Save account address=${address} nonce=${account?.nonce} balance=${account?.balance} contract=${account && account.isContract() ? 'yes' : 'no'} empty=${account && account.isEmpty() ? 'yes' : 'no'}`);
        }
        if (account !== undefined) {
            this._accountCache.put(address, account);
        }
        else {
            this._accountCache.del(address);
        }
    }
    /**
     * Gets the account associated with `address`, modifies the given account
     * fields, then saves the account into state. Account fields can include
     * `nonce`, `balance`, `storageRoot`, and `codeHash`.
     * @param address - Address of the account to modify
     * @param accountFields - Object containing account fields and values to modify
     */
    async modifyAccountFields(address, accountFields) {
        if (this.DEBUG) {
            this._debug(`modifying account fields for ${address.toString()}`);
            this._debug(JSON.stringify(accountFields, (k, v) => {
                if (k === 'nonce')
                    return v.toString();
                return v;
            }, 2));
        }
        let account = await this.getAccount(address);
        if (!account) {
            account = new ethereumjs_util_1.Account();
        }
        account.nonce = accountFields.nonce ?? account.nonce;
        account.balance = accountFields.balance ?? account.balance;
        account.storageRoot = accountFields.storageRoot ?? account.storageRoot;
        account.codeHash = accountFields.codeHash ?? account.codeHash;
        await this.putAccount(address, account);
    }
    /**
     * Deletes an account from state under the provided `address`.
     * @param address - Address of the account which should be deleted
     */
    async deleteAccount(address) {
        if (this.DEBUG) {
            this._debug(`deleting account corresponding to ${address.toString()}`);
        }
        this._accountCache.del(address);
    }
    /**
     * Get an EIP-1186 proof from the provider
     * @param address address to get proof of
     * @param storageSlots storage slots to get proof of
     * @returns an EIP-1186 formatted proof
     */
    async getProof(address, storageSlots = []) {
        if (this.DEBUG)
            this._debug(`retrieving proof from provider for ${address.toString()}`);
        const proof = await (0, ethereumjs_util_1.fetchFromProvider)(this._provider, {
            method: 'eth_getProof',
            params: [
                address.toString(),
                [storageSlots.map((slot) => (0, ethereumjs_util_1.bytesToHex)(slot))],
                this._blockTag,
            ],
        });
        return proof;
    }
    /**
     * Checkpoints the current state of the StateManager instance.
     * State changes that follow can then be committed by calling
     * `commit` or `reverted` by calling rollback.
     *
     * Partial implementation, called from the subclass.
     */
    async checkpoint() {
        this._accountCache.checkpoint();
        this._storageCache.checkpoint();
    }
    /**
     * Commits the current change-set to the instance since the
     * last call to checkpoint.
     *
     * Partial implementation, called from the subclass.
     */
    async commit() {
        // setup cache checkpointing
        this._accountCache.commit();
    }
    /**
     * Reverts the current change-set to the instance since the
     * last call to checkpoint.
     *
     * Partial implementation , called from the subclass.
     */
    async revert() {
        this._accountCache.revert();
        this._storageCache.revert();
        this._contractCache.clear();
    }
    async flush() {
        this._accountCache.flush();
    }
    generateCanonicalGenesis(_initState) {
        return Promise.resolve();
    }
}
exports.RPCStateManager = RPCStateManager;
class RPCBlockChain {
    constructor(provider) {
        if (provider === undefined || provider === '')
            throw new Error('provider URL is required');
        this.provider = provider;
    }
    async getBlock(blockId) {
        const block = await (0, ethereumjs_util_1.fetchFromProvider)(this.provider, {
            method: 'eth_getBlockByNumber',
            params: [(0, ethereumjs_util_1.intToHex)(blockId), false],
        });
        return {
            hash: () => (0, ethereumjs_util_1.hexToBytes)(block.hash),
        };
    }
    shallowCopy() {
        return this;
    }
}
exports.RPCBlockChain = RPCBlockChain;
//# sourceMappingURL=rpcStateManager.js.map