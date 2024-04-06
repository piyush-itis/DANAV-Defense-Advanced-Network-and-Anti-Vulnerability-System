import { BaseVerkleNode } from './baseVerkleNode.js';
import { VerkleNodeType } from './types.js';
import type { Point } from '../types.js';
import type { VerkleNodeOptions } from './types.js';
export declare class LeafNode extends BaseVerkleNode<VerkleNodeType.Leaf> {
    stem: Uint8Array;
    values: Uint8Array[];
    c1: Point;
    c2: Point;
    type: VerkleNodeType;
    constructor(options: VerkleNodeOptions[VerkleNodeType.Leaf]);
    static create(stem: Uint8Array, values: Uint8Array[]): LeafNode;
    static fromRawNode(rawNode: Uint8Array[], depth: number): LeafNode;
    commit(): Point;
    getValue(index: number): Uint8Array | null;
    insert(key: Uint8Array, value: Uint8Array, nodeResolverFn: () => void): void;
    insertMultiple(key: Uint8Array, values: Uint8Array[]): void;
    insertStem(key: Uint8Array, value: Uint8Array[], resolver: () => void): void;
    raw(): Uint8Array[];
    setDepth(depth: number): void;
}
//# sourceMappingURL=leafNode.d.ts.map