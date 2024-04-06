import { BaseVerkleNode } from './baseVerkleNode.js';
import { VerkleNodeType } from './types.js';
import type { Point } from '../types.js';
import type { VerkleNode, VerkleNodeOptions } from './types.js';
export declare class InternalNode extends BaseVerkleNode<VerkleNodeType.Internal> {
    children: Array<VerkleNode | null>;
    copyOnWrite: Record<string, Point>;
    type: VerkleNodeType;
    constructor(options: VerkleNodeOptions[VerkleNodeType.Internal]);
    commit(): Point;
    cowChild(_: number): void;
    setChild(index: number, child: VerkleNode): void;
    static fromRawNode(rawNode: Uint8Array[], depth: number): InternalNode;
    static create(depth: number): InternalNode;
    getChildren(index: number): VerkleNode | null;
    insert(key: Uint8Array, value: Uint8Array, resolver: () => void): void;
    insertStem(stem: Uint8Array, values: Uint8Array[], resolver: () => void): void;
    raw(): Uint8Array[];
}
//# sourceMappingURL=internalNode.d.ts.map