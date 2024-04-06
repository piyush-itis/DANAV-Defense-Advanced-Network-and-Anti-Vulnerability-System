"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRawNode = exports.decodeNode = exports.decodeRawNode = void 0;
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const internalNode_js_1 = require("./internalNode.js");
const leafNode_js_1 = require("./leafNode.js");
const types_js_1 = require("./types.js");
function decodeRawNode(raw) {
    const nodeType = raw[0][0];
    const depth = 0;
    switch (nodeType) {
        case types_js_1.VerkleNodeType.Internal:
            return internalNode_js_1.InternalNode.fromRawNode(raw, depth);
        case types_js_1.VerkleNodeType.Leaf:
            return leafNode_js_1.LeafNode.fromRawNode(raw, depth);
        default:
            throw new Error('Invalid node type');
    }
}
exports.decodeRawNode = decodeRawNode;
function decodeNode(raw) {
    const decoded = ethereumjs_rlp_1.RLP.decode(Uint8Array.from(raw));
    if (!Array.isArray(decoded)) {
        throw new Error('Invalid node');
    }
    return decodeRawNode(decoded);
}
exports.decodeNode = decodeNode;
function isRawNode(node) {
    return Array.isArray(node) && !(node instanceof Uint8Array);
}
exports.isRawNode = isRawNode;
//# sourceMappingURL=util.js.map