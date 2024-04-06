export declare const params: {
    DATASET_BYTES_INIT: number;
    DATASET_BYTES_GROWTH: number;
    CACHE_BYTES_INIT: number;
    CACHE_BYTES_GROWTH: number;
    CACHE_MULTIPLIER: number;
    EPOCH_LENGTH: number;
    MIX_BYTES: number;
    HASH_BYTES: number;
    DATASET_PARENTS: number;
    CACHE_ROUNDS: number;
    ACCESSES: number;
    WORD_BYTES: number;
};
export declare function getCacheSize(epoc: number): Promise<number>;
export declare function getFullSize(epoc: number): Promise<number>;
export declare function getEpoc(blockNumber: bigint): number;
/**
 * Generates a seed give the end epoc and optional the beginning epoc and the
 * beginning epoc seed
 * @method getSeed
 * @param seed Uint8Array
 * @param begin Number
 * @param end Number
 */
export declare function getSeed(seed: Uint8Array, begin: number, end: number): Uint8Array;
export declare function fnv(x: number, y: number): number;
export declare function fnvBytes(a: Uint8Array, b: Uint8Array): Uint8Array;
export declare function bytesReverse(a: Uint8Array): Uint8Array;
//# sourceMappingURL=util.d.ts.map