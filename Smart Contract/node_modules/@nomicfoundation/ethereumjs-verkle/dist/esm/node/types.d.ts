import type { Point } from '../types.js';
import type { InternalNode } from './internalNode.js';
import type { LeafNode } from './leafNode.js';
export declare enum VerkleNodeType {
    Internal = 0,
    Leaf = 1
}
export interface TypedVerkleNode {
    [VerkleNodeType.Internal]: InternalNode;
    [VerkleNodeType.Leaf]: LeafNode;
}
export declare type VerkleNode = TypedVerkleNode[VerkleNodeType];
export interface VerkleNodeInterface {
    commit(): Point;
    hash(): any;
    serialize(): Uint8Array;
}
interface BaseVerkleNodeOptions {
    commitment: Point;
    depth: number;
}
interface VerkleInternalNodeOptions extends BaseVerkleNodeOptions {
    children?: VerkleNode[];
    copyOnWrite?: Record<string, Point>;
}
interface VerkleLeafNodeOptions extends BaseVerkleNodeOptions {
    stem: Uint8Array;
    values: Uint8Array[];
    c1: Point;
    c2: Point;
}
export interface VerkleNodeOptions {
    [VerkleNodeType.Internal]: VerkleInternalNodeOptions;
    [VerkleNodeType.Leaf]: VerkleLeafNodeOptions;
}
export declare const NODE_WIDTH = 256;
export {};
//# sourceMappingURL=types.d.ts.map