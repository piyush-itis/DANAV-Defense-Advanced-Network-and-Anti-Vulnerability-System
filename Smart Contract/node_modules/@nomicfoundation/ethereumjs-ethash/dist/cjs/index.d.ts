/// <reference types="node" />
import { Block, BlockHeader } from '@nomicfoundation/ethereumjs-block';
import type { DB, DBObject } from '@nomicfoundation/ethereumjs-util';
export declare type Solution = {
    mixHash: Uint8Array;
    nonce: Uint8Array;
};
export declare class Miner {
    private blockHeader;
    private block?;
    private ethash;
    solution?: Solution;
    private currentNonce;
    private headerHash?;
    private stopMining;
    /**
     * Create a Miner object
     * @param mineObject - The object to mine on, either a `BlockHeader` or a `Block` object
     * @param ethash - Ethash object to use for mining
     */
    constructor(mineObject: BlockHeader | Block, ethash: Ethash);
    /**
     * Stop the miner on the next iteration
     */
    stop(): void;
    /**
     * Iterate `iterations` time over nonces, returns a `BlockHeader` or `Block` if a solution is found, `undefined` otherwise
     * @param iterations - Number of iterations to iterate over. If `-1` is passed, the loop runs until a solution is found
     * @returns - `undefined` if no solution was found within the iterations, or a `BlockHeader` or `Block`
     *           with valid PoW based upon what was passed in the constructor
     */
    mine(iterations?: number): Promise<undefined | BlockHeader | Block>;
    /**
     * Iterate `iterations` times over nonces to find a valid PoW. Caches solution if one is found
     * @param iterations - Number of iterations to iterate over. If `-1` is passed, the loop runs until a solution is found
     * @returns - `undefined` if no solution was found, or otherwise a `Solution` object
     */
    iterate(iterations?: number): Promise<undefined | Solution>;
}
export declare class Ethash {
    dbOpts: Object;
    cacheDB?: DB<number, DBObject>;
    cache: Uint8Array[];
    epoc?: number;
    fullSize?: number;
    cacheSize?: number;
    seed?: Uint8Array;
    constructor(cacheDB?: DB<number, DBObject>);
    mkcache(cacheSize: number, seed: Uint8Array): Uint8Array[];
    calcDatasetItem(i: number): Uint8Array;
    run(val: Uint8Array, nonce: Uint8Array, fullSize?: number): {
        mix: Uint8Array;
        hash: Buffer;
    };
    cacheHash(): Buffer;
    headerHash(rawHeader: Uint8Array[]): Buffer;
    /**
     * Loads the seed and cache given a block number.
     */
    loadEpoc(number: bigint): Promise<void>;
    /**
     * Returns a `Miner` object
     * To mine a `BlockHeader` or `Block`, use the one-liner `await ethash.getMiner(block).mine(-1)`
     * @param mineObject - Object to mine on, either a `BlockHeader` or a `Block`
     * @returns - A miner object
     */
    getMiner(mineObject: BlockHeader | Block): Miner;
    _verifyPOW(header: BlockHeader): Promise<boolean>;
    verifyPOW(block: Block): Promise<boolean>;
}
//# sourceMappingURL=index.d.ts.map