import { RLP } from '@nomicfoundation/ethereumjs-rlp';
import { InternalNode } from './internalNode.js';
import { LeafNode } from './leafNode.js';
import { VerkleNodeType } from './types.js';
export function decodeRawNode(raw) {
    const nodeType = raw[0][0];
    const depth = 0;
    switch (nodeType) {
        case VerkleNodeType.Internal:
            return InternalNode.fromRawNode(raw, depth);
        case VerkleNodeType.Leaf:
            return LeafNode.fromRawNode(raw, depth);
        default:
            throw new Error('Invalid node type');
    }
}
export function decodeNode(raw) {
    const decoded = RLP.decode(Uint8Array.from(raw));
    if (!Array.isArray(decoded)) {
        throw new Error('Invalid node');
    }
    return decodeRawNode(decoded);
}
export function isRawNode(node) {
    return Array.isArray(node) && !(node instanceof Uint8Array);
}
//# sourceMappingURL=util.js.map