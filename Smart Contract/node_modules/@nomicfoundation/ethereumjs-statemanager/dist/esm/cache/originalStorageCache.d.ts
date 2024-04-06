import type { Address } from '@nomicfoundation/ethereumjs-util';
declare type getContractStorage = (address: Address, key: Uint8Array) => Promise<Uint8Array>;
export declare class OriginalStorageCache {
    private map;
    private getContractStorage;
    constructor(getContractStorage: getContractStorage);
    get(address: Address, key: Uint8Array): Promise<Uint8Array>;
    put(address: Address, key: Uint8Array, value: Uint8Array): void;
    clear(): void;
}
export {};
//# sourceMappingURL=originalStorageCache.d.ts.map