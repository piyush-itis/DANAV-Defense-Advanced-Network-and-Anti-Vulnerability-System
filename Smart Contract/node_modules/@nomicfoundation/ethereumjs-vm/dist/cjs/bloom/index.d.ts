import type { Common } from '@nomicfoundation/ethereumjs-common';
export declare class Bloom {
    bitvector: Uint8Array;
    keccakFunction: (msg: Uint8Array) => Uint8Array;
    /**
     * Represents a Bloom filter.
     */
    constructor(bitvector?: Uint8Array, common?: Common);
    /**
     * Adds an element to a bit vector of a 64 byte bloom filter.
     * @param e - The element to add
     */
    add(e: Uint8Array): void;
    /**
     * Checks if an element is in the bloom.
     * @param e - The element to check
     */
    check(e: Uint8Array): boolean;
    /**
     * Checks if multiple topics are in a bloom.
     * @returns `true` if every topic is in the bloom
     */
    multiCheck(topics: Uint8Array[]): boolean;
    /**
     * Bitwise or blooms together.
     */
    or(bloom: Bloom): void;
}
//# sourceMappingURL=index.d.ts.map