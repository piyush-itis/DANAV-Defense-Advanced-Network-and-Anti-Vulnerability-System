declare const HEADS_KEY = "heads";
/**
 * Current canonical head for light sync
 */
declare const HEAD_HEADER_KEY = "LastHeader";
/**
 * Current canonical head for full sync
 */
declare const HEAD_BLOCK_KEY = "LastBlock";
/**
 * Convert bigint to big endian Uint8Array
 */
declare const bytesBE8: (n: bigint) => Uint8Array;
declare const tdKey: (n: bigint, hash: Uint8Array) => Uint8Array;
declare const headerKey: (n: bigint, hash: Uint8Array) => Uint8Array;
declare const bodyKey: (n: bigint, hash: Uint8Array) => Uint8Array;
declare const numberToHashKey: (n: bigint) => Uint8Array;
declare const hashToNumberKey: (hash: Uint8Array) => Uint8Array;
/**
 * @hidden
 */
export { bodyKey, bytesBE8, hashToNumberKey, HEAD_BLOCK_KEY, HEAD_HEADER_KEY, headerKey, HEADS_KEY, numberToHashKey, tdKey, };
//# sourceMappingURL=constants.d.ts.map