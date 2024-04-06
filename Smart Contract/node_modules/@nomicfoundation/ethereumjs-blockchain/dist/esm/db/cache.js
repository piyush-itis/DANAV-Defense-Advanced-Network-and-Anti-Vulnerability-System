import { bytesToUnprefixedHex } from '@nomicfoundation/ethereumjs-util';
import { LRUCache } from 'lru-cache';
/**
 * Simple LRU Cache that allows for keys of type Uint8Array
 * @hidden
 */
export class Cache {
    constructor(opts) {
        this._cache = new LRUCache(opts);
    }
    set(key, value) {
        if (key instanceof Uint8Array) {
            key = bytesToUnprefixedHex(key);
        }
        this._cache.set(key, { value });
    }
    get(key) {
        if (key instanceof Uint8Array) {
            key = bytesToUnprefixedHex(key);
        }
        const elem = this._cache.get(key);
        return elem !== undefined ? elem.value : undefined;
    }
    del(key) {
        if (key instanceof Uint8Array) {
            key = bytesToUnprefixedHex(key);
        }
        this._cache.delete(key);
    }
}
//# sourceMappingURL=cache.js.map