import { isProbablyPrime } from 'bigint-crypto-utils';
import { keccak256 } from 'ethereum-cryptography/keccak.js';
export const params = {
    DATASET_BYTES_INIT: 1073741824,
    DATASET_BYTES_GROWTH: 8388608,
    CACHE_BYTES_INIT: 16777216,
    CACHE_BYTES_GROWTH: 131072,
    CACHE_MULTIPLIER: 1024,
    EPOCH_LENGTH: 30000,
    MIX_BYTES: 128,
    HASH_BYTES: 64,
    DATASET_PARENTS: 256,
    CACHE_ROUNDS: 3,
    ACCESSES: 64,
    WORD_BYTES: 4,
};
export async function getCacheSize(epoc) {
    const { CACHE_BYTES_INIT, CACHE_BYTES_GROWTH, HASH_BYTES } = params;
    let sz = CACHE_BYTES_INIT + CACHE_BYTES_GROWTH * epoc;
    sz -= HASH_BYTES;
    while (!(await isProbablyPrime(sz / HASH_BYTES, undefined, true))) {
        sz -= 2 * HASH_BYTES;
    }
    return sz;
}
export async function getFullSize(epoc) {
    const { DATASET_BYTES_INIT, DATASET_BYTES_GROWTH, MIX_BYTES } = params;
    let sz = DATASET_BYTES_INIT + DATASET_BYTES_GROWTH * epoc;
    sz -= MIX_BYTES;
    while (!(await isProbablyPrime(sz / MIX_BYTES, undefined, true))) {
        sz -= 2 * MIX_BYTES;
    }
    return sz;
}
export function getEpoc(blockNumber) {
    return Number(blockNumber / BigInt(params.EPOCH_LENGTH));
}
/**
 * Generates a seed give the end epoc and optional the beginning epoc and the
 * beginning epoc seed
 * @method getSeed
 * @param seed Uint8Array
 * @param begin Number
 * @param end Number
 */
export function getSeed(seed, begin, end) {
    for (let i = begin; i < end; i++) {
        seed = keccak256(Buffer.from(seed));
    }
    return seed;
}
export function fnv(x, y) {
    return ((((x * 0x01000000) | 0) + ((x * 0x193) | 0)) ^ y) >>> 0;
}
export function fnvBytes(a, b) {
    const r = new Uint8Array(a.length);
    const rView = new DataView(r.buffer);
    for (let i = 0; i < a.length; i = i + 4) {
        rView.setUint32(i, fnv(new DataView(a.buffer).getUint32(i, true), new DataView(b.buffer).getUint32(i, true)), true);
    }
    return r;
}
export function bytesReverse(a) {
    const length = a.length;
    const b = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        b[i] = a[length - i - 1];
    }
    return b;
}
//# sourceMappingURL=util.js.map