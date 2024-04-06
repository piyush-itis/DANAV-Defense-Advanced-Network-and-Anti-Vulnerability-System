"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const lru_cache_1 = require("lru-cache");
/**
 * Simple LRU Cache that allows for keys of type Uint8Array
 * @hidden
 */
class Cache {
    constructor(opts) {
        this._cache = new lru_cache_1.LRUCache(opts);
    }
    set(key, value) {
        if (key instanceof Uint8Array) {
            key = (0, ethereumjs_util_1.bytesToUnprefixedHex)(key);
        }
        this._cache.set(key, { value });
    }
    get(key) {
        if (key instanceof Uint8Array) {
            key = (0, ethereumjs_util_1.bytesToUnprefixedHex)(key);
        }
        const elem = this._cache.get(key);
        return elem !== undefined ? elem.value : undefined;
    }
    del(key) {
        if (key instanceof Uint8Array) {
            key = (0, ethereumjs_util_1.bytesToUnprefixedHex)(key);
        }
        this._cache.delete(key);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map