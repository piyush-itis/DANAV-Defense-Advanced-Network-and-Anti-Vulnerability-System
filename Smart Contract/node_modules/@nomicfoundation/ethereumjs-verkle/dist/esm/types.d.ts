import type { VerkleNode } from './node/index.js';
import type { WalkController } from './util/walkController.js';
import type { DB } from '@nomicfoundation/ethereumjs-util';
export interface Fr {
}
export interface Point {
    bytes(): Uint8Array;
    bytesUncompressed(): Uint8Array;
    setBytes(bytes: Uint8Array): void;
    setBytesUncompressed(bytes: Uint8Array, trusted: boolean): void;
    mapToBaseField(): Point;
    mapToScalarField(field: Fr): void;
    equal(secondPoint: Point): boolean;
    setIdentity(): Point;
    double(point1: Point): Point;
    add(point1: Point, point2: Point): Point;
    sub(point1: Point, point2: Point): Point;
    isOnCurve(): boolean;
    normalise(): void;
    set(): Point;
    neg(): Point;
    scalarMul(point1: Point, scalarMont: Fr): Point;
}
export declare type Proof = Uint8Array[];
export interface VerkleTreeOpts {
    /**
     * A database instance.
     */
    db?: DB<Uint8Array, Uint8Array>;
    /**
     * A `Uint8Array` for the root of a previously stored tree
     */
    root?: Uint8Array;
    /**
     * Store the root inside the database after every `write` operation
     */
    useRootPersistence?: boolean;
    /**
     * LRU cache for tree nodes to allow for faster node retrieval.
     *
     * Default: 0 (deactivated)
     */
    cacheSize?: number;
}
export declare type VerkleTreeOptsWithDefaults = VerkleTreeOpts & {
    useRootPersistence: boolean;
    cacheSize: number;
};
export interface CheckpointDBOpts {
    /**
     * A database instance.
     */
    db: DB<Uint8Array, Uint8Array>;
    /**
     * Cache size (default: 0)
     */
    cacheSize?: number;
}
export declare type Checkpoint = {
    keyValueMap: Map<string, Uint8Array | undefined>;
    root: Uint8Array;
};
export declare type FoundNodeFunction = (nodeRef: Uint8Array, node: VerkleNode | null, key: Uint8Array, walkController: WalkController) => void;
export declare const ROOT_DB_KEY: Uint8Array;
//# sourceMappingURL=types.d.ts.map