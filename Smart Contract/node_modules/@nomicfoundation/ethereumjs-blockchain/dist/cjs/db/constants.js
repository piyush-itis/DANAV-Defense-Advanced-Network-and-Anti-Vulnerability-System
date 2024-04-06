"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tdKey = exports.numberToHashKey = exports.HEADS_KEY = exports.headerKey = exports.HEAD_HEADER_KEY = exports.HEAD_BLOCK_KEY = exports.hashToNumberKey = exports.bytesBE8 = exports.bodyKey = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
// Geth compatible DB keys
const HEADS_KEY = 'heads';
exports.HEADS_KEY = HEADS_KEY;
/**
 * Current canonical head for light sync
 */
const HEAD_HEADER_KEY = 'LastHeader';
exports.HEAD_HEADER_KEY = HEAD_HEADER_KEY;
/**
 * Current canonical head for full sync
 */
const HEAD_BLOCK_KEY = 'LastBlock';
exports.HEAD_BLOCK_KEY = HEAD_BLOCK_KEY;
/**
 * headerPrefix + number + hash -> header
 */
const HEADER_PREFIX = (0, ethereumjs_util_1.utf8ToBytes)('h');
/**
 * headerPrefix + number + hash + tdSuffix -> td
 */
const TD_SUFFIX = (0, ethereumjs_util_1.utf8ToBytes)('t');
/**
 * headerPrefix + number + numSuffix -> hash
 */
const NUM_SUFFIX = (0, ethereumjs_util_1.utf8ToBytes)('n');
/**
 * blockHashPrefix + hash -> number
 */
const BLOCK_HASH_PEFIX = (0, ethereumjs_util_1.utf8ToBytes)('H');
/**
 * bodyPrefix + number + hash -> block body
 */
const BODY_PREFIX = (0, ethereumjs_util_1.utf8ToBytes)('b');
// Utility functions
/**
 * Convert bigint to big endian Uint8Array
 */
const bytesBE8 = (n) => (0, ethereumjs_util_1.bigIntToBytes)(BigInt.asUintN(64, n));
exports.bytesBE8 = bytesBE8;
const tdKey = (n, hash) => (0, ethereumjs_util_1.concatBytes)(HEADER_PREFIX, bytesBE8(n), hash, TD_SUFFIX);
exports.tdKey = tdKey;
const headerKey = (n, hash) => (0, ethereumjs_util_1.concatBytes)(HEADER_PREFIX, bytesBE8(n), hash);
exports.headerKey = headerKey;
const bodyKey = (n, hash) => (0, ethereumjs_util_1.concatBytes)(BODY_PREFIX, bytesBE8(n), hash);
exports.bodyKey = bodyKey;
const numberToHashKey = (n) => (0, ethereumjs_util_1.concatBytes)(HEADER_PREFIX, bytesBE8(n), NUM_SUFFIX);
exports.numberToHashKey = numberToHashKey;
const hashToNumberKey = (hash) => (0, ethereumjs_util_1.concatBytes)(BLOCK_HASH_PEFIX, hash);
exports.hashToNumberKey = hashToNumberKey;
//# sourceMappingURL=constants.js.map