"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBManager = void 0;
const ethereumjs_block_1 = require("@nomicfoundation/ethereumjs-block");
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const cache_js_1 = require("./cache.js");
const operation_js_1 = require("./operation.js");
/**
 * Abstraction over a DB to facilitate storing/fetching blockchain-related
 * data, such as blocks and headers, indices, and the head block.
 * @hidden
 */
class DBManager {
    constructor(db, common) {
        this._db = db;
        this.common = common;
        this._cache = {
            td: new cache_js_1.Cache({ max: 1024 }),
            header: new cache_js_1.Cache({ max: 512 }),
            body: new cache_js_1.Cache({ max: 256 }),
            numberToHash: new cache_js_1.Cache({ max: 2048 }),
            hashToNumber: new cache_js_1.Cache({ max: 2048 }),
        };
    }
    /**
     * Fetches iterator heads from the db.
     */
    async getHeads() {
        const heads = (await this.get(operation_js_1.DBTarget.Heads));
        if (heads === undefined)
            return heads;
        const decodedHeads = {};
        for (const key of Object.keys(heads)) {
            // Heads are stored in DB as hex strings since Level converts Uint8Arrays
            // to nested JSON objects when they are included in a value being stored
            // in the DB
            decodedHeads[key] = (0, ethereumjs_util_1.unprefixedHexToBytes)(heads[key]);
        }
        return decodedHeads;
    }
    /**
     * Fetches header of the head block.
     */
    async getHeadHeader() {
        return this.get(operation_js_1.DBTarget.HeadHeader);
    }
    /**
     * Fetches head block.
     */
    async getHeadBlock() {
        return this.get(operation_js_1.DBTarget.HeadBlock);
    }
    /**
     * Fetches a block (header and body) given a block id,
     * which can be either its hash or its number.
     */
    async getBlock(blockId) {
        if (typeof blockId === 'number' && Number.isInteger(blockId)) {
            blockId = BigInt(blockId);
        }
        let number;
        let hash;
        if (blockId === undefined)
            return undefined;
        if (blockId instanceof Uint8Array) {
            hash = blockId;
            number = await this.hashToNumber(blockId);
        }
        else if (typeof blockId === 'bigint') {
            number = blockId;
            hash = await this.numberToHash(blockId);
        }
        else {
            throw new Error('Unknown blockId type');
        }
        if (hash === undefined || number === undefined)
            return undefined;
        const header = await this.getHeader(hash, number);
        const body = await this.getBody(hash, number);
        if (body[0].length === 0 && body[1].length === 0) {
            // Do extra validations on the header since we are assuming empty transactions and uncles
            if (!(0, ethereumjs_util_1.equalsBytes)(header.transactionsTrie, ethereumjs_util_1.KECCAK256_RLP)) {
                throw new Error('transactionsTrie root should be equal to hash of null');
            }
            if (!(0, ethereumjs_util_1.equalsBytes)(header.uncleHash, ethereumjs_util_1.KECCAK256_RLP_ARRAY)) {
                throw new Error('uncle hash should be equal to hash of empty array');
            }
            // If this block had empty withdrawals push an empty array in body
            if (header.withdrawalsRoot !== undefined) {
                // Do extra validations for withdrawal before assuming empty withdrawals
                if (!(0, ethereumjs_util_1.equalsBytes)(header.withdrawalsRoot, ethereumjs_util_1.KECCAK256_RLP) &&
                    (body.length < 3 || body[2]?.length === 0)) {
                    throw new Error('withdrawals root shoot be equal to hash of null when no withdrawals');
                }
                if (body.length <= 3)
                    body.push([]);
            }
        }
        const blockData = [header.raw(), ...body];
        const opts = { common: this.common };
        if (number === ethereumjs_util_1.BIGINT_0) {
            opts.setHardfork = await this.getTotalDifficulty(hash, ethereumjs_util_1.BIGINT_0);
        }
        else {
            opts.setHardfork = await this.getTotalDifficulty(header.parentHash, number - ethereumjs_util_1.BIGINT_1);
        }
        return ethereumjs_block_1.Block.fromValuesArray(blockData, opts);
    }
    /**
     * Fetches body of a block given its hash and number.
     */
    async getBody(blockHash, blockNumber) {
        const body = await this.get(operation_js_1.DBTarget.Body, { blockHash, blockNumber });
        if (body === undefined) {
            return [[], []];
        }
        return ethereumjs_rlp_1.RLP.decode(body);
    }
    /**
     * Fetches header of a block given its hash and number.
     */
    async getHeader(blockHash, blockNumber) {
        const encodedHeader = await this.get(operation_js_1.DBTarget.Header, { blockHash, blockNumber });
        const headerValues = ethereumjs_rlp_1.RLP.decode(encodedHeader);
        const opts = { common: this.common };
        if (blockNumber === ethereumjs_util_1.BIGINT_0) {
            opts.setHardfork = await this.getTotalDifficulty(blockHash, ethereumjs_util_1.BIGINT_0);
        }
        else {
            // Lets fetch the parent hash but not by number since this block might not
            // be in canonical chain
            const headerData = (0, ethereumjs_block_1.valuesArrayToHeaderData)(headerValues);
            const parentHash = headerData.parentHash;
            opts.setHardfork = await this.getTotalDifficulty(parentHash, blockNumber - ethereumjs_util_1.BIGINT_1);
        }
        return ethereumjs_block_1.BlockHeader.fromValuesArray(headerValues, opts);
    }
    /**
     * Fetches total difficulty for a block given its hash and number.
     */
    async getTotalDifficulty(blockHash, blockNumber) {
        const td = await this.get(operation_js_1.DBTarget.TotalDifficulty, { blockHash, blockNumber });
        return (0, ethereumjs_util_1.bytesToBigInt)(ethereumjs_rlp_1.RLP.decode(td));
    }
    /**
     * Performs a block hash to block number lookup.
     */
    async hashToNumber(blockHash) {
        const value = await this.get(operation_js_1.DBTarget.HashToNumber, { blockHash });
        if (value === undefined) {
            throw new Error(`value for ${(0, ethereumjs_util_1.bytesToHex)(blockHash)} not found in DB`);
        }
        return value !== undefined ? (0, ethereumjs_util_1.bytesToBigInt)(value) : undefined;
    }
    /**
     * Performs a block number to block hash lookup.
     */
    async numberToHash(blockNumber) {
        const value = await this.get(operation_js_1.DBTarget.NumberToHash, { blockNumber });
        return value;
    }
    /**
     * Fetches a key from the db. If `opts.cache` is specified
     * it first tries to load from cache, and on cache miss will
     * try to put the fetched item on cache afterwards.
     */
    async get(dbOperationTarget, key) {
        const dbGetOperation = operation_js_1.DBOp.get(dbOperationTarget, key);
        const cacheString = dbGetOperation.cacheString;
        const dbKey = dbGetOperation.baseDBOp.key;
        if (cacheString !== undefined) {
            if (this._cache[cacheString] === undefined) {
                throw new Error(`Invalid cache: ${cacheString}`);
            }
            let value = this._cache[cacheString].get(dbKey);
            if (value === undefined) {
                value = (await this._db.get(dbKey, {
                    keyEncoding: dbGetOperation.baseDBOp.keyEncoding,
                    valueEncoding: dbGetOperation.baseDBOp.valueEncoding,
                }));
                if (value !== undefined) {
                    this._cache[cacheString].set(dbKey, value);
                }
            }
            return value;
        }
        return this._db.get(dbKey, {
            keyEncoding: dbGetOperation.baseDBOp.keyEncoding,
            valueEncoding: dbGetOperation.baseDBOp.valueEncoding,
        });
    }
    /**
     * Performs a batch operation on db.
     */
    async batch(ops) {
        const convertedOps = ops.map((op) => {
            const type = op.baseDBOp.type !== undefined
                ? op.baseDBOp.type
                : op.baseDBOp.value !== undefined
                    ? 'put'
                    : 'del';
            const convertedOp = {
                key: op.baseDBOp.key,
                value: op.baseDBOp.value,
                type,
                opts: {
                    keyEncoding: op.baseDBOp.keyEncoding,
                    valueEncoding: op.baseDBOp.valueEncoding,
                },
            };
            if (type === 'put')
                return convertedOp;
            else
                return convertedOp;
        });
        // update the current cache for each operation
        ops.map((op) => op.updateCache(this._cache));
        return this._db.batch(convertedOps);
    }
}
exports.DBManager = DBManager;
//# sourceMappingURL=manager.js.map