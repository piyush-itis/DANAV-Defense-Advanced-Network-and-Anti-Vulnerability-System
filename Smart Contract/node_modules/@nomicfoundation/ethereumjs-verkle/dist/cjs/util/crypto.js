"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POINT_IDENTITY = exports.verifyProof = exports.getKey = exports.getStem = exports.verifyUpdate = exports.pedersenHash = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const rust_verkle_wasm_1 = require("rust-verkle-wasm");
function pedersenHash(input) {
    const pedersenHash = (0, rust_verkle_wasm_1.pedersen_hash)(input);
    if (pedersenHash === null) {
        throw new Error(`pedersenHash: Wrong pedersenHash input: ${(0, ethereumjs_util_1.bytesToHex)(input)}. This might happen if length is not correct.`);
    }
    return pedersenHash;
}
exports.pedersenHash = pedersenHash;
function verifyUpdate(root, proof, keyValues) {
    return (0, rust_verkle_wasm_1.verify_update)(root, proof, keyValues);
}
exports.verifyUpdate = verifyUpdate;
/**
 * @dev Returns the 31-bytes verkle tree stem for a given address and tree index.
 * @dev Assumes that the verkle node width = 256
 * @param address The address to generate the tree key for.
 * @param treeIndex The index of the tree to generate the key for. Defaults to 0.
 * @return The 31-bytes verkle tree stem as a Uint8Array.
 */
function getStem(address, treeIndex = 0) {
    const address32 = (0, ethereumjs_util_1.setLengthLeft)(address.toBytes(), 32);
    const treeIndexBytes = (0, ethereumjs_util_1.setLengthRight)((0, ethereumjs_util_1.int32ToBytes)(treeIndex, true), 32);
    const input = (0, ethereumjs_util_1.concatBytes)(address32, treeIndexBytes);
    const treeStem = pedersenHash(input).slice(0, 31);
    return treeStem;
}
exports.getStem = getStem;
/**
 * @dev Returns the tree key for a given verkle tree stem, and sub index.
 * @dev Assumes that the verkle node width = 256
 * @param stem The 31-bytes verkle tree stem as a Uint8Array.
 * @param subIndex The sub index of the tree to generate the key for as a Uint8Array.
 * @return The tree key as a Uint8Array.
 */
function getKey(stem, subIndex) {
    const treeKey = (0, ethereumjs_util_1.concatBytes)(stem, subIndex);
    return treeKey;
}
exports.getKey = getKey;
function verifyProof(root, proof, keyValues) {
    return (0, rust_verkle_wasm_1.verify_update)(root, proof, keyValues);
}
exports.verifyProof = verifyProof;
// TODO: Replace this by the actual value of Point().Identity() from the Go code.
exports.POINT_IDENTITY = new Uint8Array(32).fill(0);
//# sourceMappingURL=crypto.js.map