import { LRUCache } from 'lru-cache';
/**
 * Simple LRU Cache that allows for keys of type Uint8Array
 * @hidden
 */
export declare class Cache<V> {
    _cache: LRUCache<string, {
        value: V;
    }, void>;
    constructor(opts: LRUCache.Options<string, {
        value: V;
    }, void>);
    set(key: string | Uint8Array, value: V): void;
    get(key: string | Uint8Array): V | undefined;
    del(key: string | Uint8Array): void;
}
//# sourceMappingURL=cache.d.ts.map