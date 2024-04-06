import { bytesToUnprefixedHex } from '@nomicfoundation/ethereumjs-util';
export class OriginalStorageCache {
    constructor(getContractStorage) {
        this.map = new Map();
        this.getContractStorage = getContractStorage;
    }
    async get(address, key) {
        const addressHex = bytesToUnprefixedHex(address.bytes);
        const map = this.map.get(addressHex);
        if (map !== undefined) {
            const keyHex = bytesToUnprefixedHex(key);
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
        const addressHex = bytesToUnprefixedHex(address.bytes);
        let map = this.map.get(addressHex);
        if (map === undefined) {
            map = new Map();
            this.map.set(addressHex, map);
        }
        const keyHex = bytesToUnprefixedHex(key);
        if (map.has(keyHex) === false) {
            map.set(keyHex, value);
        }
    }
    clear() {
        this.map = new Map();
    }
}
//# sourceMappingURL=originalStorageCache.js.map