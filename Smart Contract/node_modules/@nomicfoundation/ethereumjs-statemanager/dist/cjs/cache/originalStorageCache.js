"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OriginalStorageCache = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
class OriginalStorageCache {
    constructor(getContractStorage) {
        this.map = new Map();
        this.getContractStorage = getContractStorage;
    }
    async get(address, key) {
        const addressHex = (0, ethereumjs_util_1.bytesToUnprefixedHex)(address.bytes);
        const map = this.map.get(addressHex);
        if (map !== undefined) {
            const keyHex = (0, ethereumjs_util_1.bytesToUnprefixedHex)(key);
            const value = map.get(keyHex);
            if (value !== undefined) {
                return value;
            }
        }
        const value = await this.getContractStorage(address, key);
        this.put(address, key, value);
        return value;
    }
    put(address, key, value) {
        const addressHex = (0, ethereumjs_util_1.bytesToUnprefixedHex)(address.bytes);
        let map = this.map.get(addressHex);
        if (map === undefined) {
            map = new Map();
            this.map.set(addressHex, map);
        }
        const keyHex = (0, ethereumjs_util_1.bytesToUnprefixedHex)(key);
        if (map.has(keyHex) === false) {
            map.set(keyHex, value);
        }
    }
    clear() {
        this.map = new Map();
    }
}
exports.OriginalStorageCache = OriginalStorageCache;
//# sourceMappingURL=originalStorageCache.js.map