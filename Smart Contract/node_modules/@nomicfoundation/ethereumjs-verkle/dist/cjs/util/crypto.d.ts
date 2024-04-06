import { type Address } from '@nomicfoundation/ethereumjs-util';
import type { Point } from '../types.js';
export declare function pedersenHash(input: Uint8Array): Uint8Array;
export declare function verifyUpdate(root: Uint8Array, proof: Uint8Array, keyValues: Map<any, any>): Uint8Array;
/**
 * @dev Returns the 31-bytes verkle tree stem for a given address and tree index.
 * @dev Assumes that the verkle node width = 256
 * @param address The address to generate the tree key for.
 * @param treeIndex The index of the tree to generate the key for. Defaults to 0.
 * @return The 31-bytes verkle tree stem as a Uint8Array.
 */
export declare function getStem(address: Address, treeIndex?: number): Uint8Array;
/**
 * @dev Returns the tree key for a given verkle tree stem, and sub index.
 * @dev Assumes that the verkle node width = 256
 * @param stem The 31-bytes verkle tree stem as a Uint8Array.
 * @param subIndex The sub index of the tree to generate the key for as a Uint8Array.
 * @return The tree key as a Uint8Array.
 */
export declare function getKey(stem: Uint8Array, subIndex: Uint8Array): Uint8Array;
export declare function verifyProof(root: Uint8Array, proof: Uint8Array, keyValues: Map<any, any>): Uint8Array;
export declare const POINT_IDENTITY: Point;
//# sourceMappingURL=crypto.d.ts.map