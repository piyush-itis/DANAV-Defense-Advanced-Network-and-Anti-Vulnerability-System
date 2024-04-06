import { Block, BlockHeader } from '@nomicfoundation/ethereumjs-block';
import { Cache } from './cache.js';
import { DBOp, DBTarget } from './operation.js';
import type { DatabaseKey } from './operation.js';
import type { BlockBodyBytes } from '@nomicfoundation/ethereumjs-block';
import type { Common } from '@nomicfoundation/ethereumjs-common';
import type { DB, DBObject } from '@nomicfoundation/ethereumjs-util';
/**
 * @hidden
 */
export interface GetOpts {
    keyEncoding?: string;
    valueEncoding?: string;
    cache?: string;
}
export declare type CacheMap = {
    [key: string]: Cache<Uint8Array>;
};
/**
 * Abstraction over a DB to facilitate storing/fetching blockchain-related
 * data, such as blocks and headers, indices, and the head block.
 * @hidden
 */
export declare class DBManager {
    private _cache;
    readonly common: Common;
    private _db;
    constructor(db: DB<Uint8Array | string, Uint8Array | string | DBObject>, common: Common);
    /**
     * Fetches iterator heads from the db.
     */
    getHeads(): Promise<{
        [key: string]: Uint8Array;
    }>;
    /**
     * Fetches header of the head block.
     */
    getHeadHeader(): Promise<Uint8Array | undefined>;
    /**
     * Fetches head block.
     */
    getHeadBlock(): Promise<Uint8Array | undefined>;
    /**
     * Fetches a block (header and body) given a block id,
     * which can be either its hash or its number.
     */
    getBlock(blockId: Uint8Array | bigint | number): Promise<Block | undefined>;
    /**
     * Fetches body of a block given its hash and number.
     */
    getBody(blockHash: Uint8Array, blockNumber: bigint): Promise<BlockBodyBytes>;
    /**
     * Fetches header of a block given its hash and number.
     */
    getHeader(blockHash: Uint8Array, blockNumber: bigint): Promise<BlockHeader>;
    /**
     * Fetches total difficulty for a block given its hash and number.
     */
    getTotalDifficulty(blockHash: Uint8Array, blockNumber: bigint): Promise<bigint>;
    /**
     * Performs a block hash to block number lookup.
     */
    hashToNumber(blockHash: Uint8Array): Promise<bigint | undefined>;
    /**
     * Performs a block number to block hash lookup.
     */
    numberToHash(blockNumber: bigint): Promise<Uint8Array | undefined>;
    /**
     * Fetches a key from the db. If `opts.cache` is specified
     * it first tries to load from cache, and on cache miss will
     * try to put the fetched item on cache afterwards.
     */
    get(dbOperationTarget: DBTarget, key?: DatabaseKey): Promise<any>;
    /**
     * Performs a batch operation on db.
     */
    batch(ops: DBOp[]): Promise<void>;
}
//# sourceMappingURL=manager.d.ts.map