import { bytesToHex, concatBytes, int32ToBytes, setLengthLeft, setLengthRight, } from '@nomicfoundation/ethereumjs-util';
import { pedersen_hash, verify_update } from 'rust-verkle-wasm';
export function pedersenHash(input) {
    const pedersenHash = pedersen_hash(input);
    if (pedersenHash === null) {
        throw new Error(`pedersenHash: Wrong pedersenHash input: ${bytesToHex(input)}. This might happen if length is not correct.`);
    }
    return pedersenHash;
}
export function verifyUpdate(root, proof, keyValues) {
    return verify_update(root, proof, keyValues);
}
/**
 * @dev Returns the 31-bytes verkle tree stem for a given address and tree index.
 * @dev Assumes that the verkle node width = 256
 * @param address The address to generate the tree key for.
 * @param treeIndex The index of the tree to generate the key for. Defaults to 0.
 * @return The 31-bytes verkle tree stem as a Uint8Array.
 */
export function getStem(address, treeIndex = 0) {
    const address32 = setLengthLeft(address.toBytes(), 32);
    const treeIndexBytes = setLengthRight(int32ToBytes(treeIndex, true), 32);
    const input = concatBytes(address32, treeIndexBytes);
    const treeStem = pedersenHash(input).slice(0, 31);
    return treeStem;
}
/**
 * @dev Returns the tree key for a given verkle tree stem, and sub index.
 * @dev Assumes that the verkle node width = 256
 * @param stem The 31-bytes verkle tree stem as a Uint8Array.
 * @param subIndex The sub index of the tree to generate the key for as a Uint8Array.
 * @return The tree key as a Uint8Array.
 */
export function getKey(stem, subIndex) {
    const treeKey = concatBytes(stem, subIndex);
    return treeKey;
}
export function verifyProof(root, proof, keyValues) {
    return verify_update(root, proof, keyValues);
}
// TODO: Replace this by the actual value of Point().Identity() from the Go code.
export const POINT_IDENTITY = new Uint8Array(32).fill(0);
//# sourceMappingURL=crypto.js.map