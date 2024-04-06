import { type VerkleNodeInterface, type VerkleNodeOptions, type VerkleNodeType } from './types.js';
import type { Point } from '../types.js';
export declare abstract class BaseVerkleNode<T extends VerkleNodeType> implements VerkleNodeInterface {
    commitment: Point;
    depth: number;
    constructor(options: VerkleNodeOptions[T]);
    abstract commit(): Point;
    hash(): Uint8Array;
    abstract insert(key: Uint8Array, value: Uint8Array, nodeResolverFn: () => void): void;
    abstract raw(): Uint8Array[];
    /**
     * @returns the RLP serialized node
     */
    serialize(): Uint8Array;
}
//# sourceMappingURL=baseVerkleNode.d.ts.map