"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafNode = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const baseVerkleNode_js_1 = require("./baseVerkleNode.js");
const types_js_1 = require("./types.js");
class LeafNode extends baseVerkleNode_js_1.BaseVerkleNode {
    constructor(options) {
        super(options);
        this.type = types_js_1.VerkleNodeType.Leaf;
        this.stem = options.stem;
        this.values = options.values;
        this.c1 = options.c1;
        this.c2 = options.c2;
    }
    static create(stem, values) {
        throw new Error('Not implemented');
    }
    static fromRawNode(rawNode, depth) {
        const nodeType = rawNode[0][0];
        if (nodeType !== types_js_1.VerkleNodeType.Leaf) {
            throw new Error('Invalid node type');
        }
        // The length of the rawNode should be the # of values (node width) + 5 for the node type, the stem, the commitment and the 2 commitments
        if (rawNode.length !== types_js_1.NODE_WIDTH + 5) {
            throw new Error('Invalid node length');
        }
        const stem = rawNode[1];
        // TODO: Convert the rawNode commitments to points
        const commitment = rawNode[2];
        const c1 = rawNode[3];
        const c2 = rawNode[4];
        const values = rawNode.slice(5, rawNode.length);
        return new LeafNode({ depth, stem, values, c1, c2, commitment });
    }
    commit() {
        throw new Error('Not implemented');
    }
    getValue(index) {
        return this.values?.[index] ?? null;
    }
    insert(key, value, nodeResolverFn) {
        const values = new Array(types_js_1.NODE_WIDTH);
        values[key[31]] = value;
        this.insertStem(key.slice(0, 31), values, nodeResolverFn);
    }
    insertMultiple(key, values) {
        throw new Error('Not implemented');
    }
    insertStem(key, value, resolver) {
        throw new Error('Not implemented');
    }
    // TODO: go-verkle also adds the bitlist to the raw format.
    raw() {
        return [
            new Uint8Array([types_js_1.VerkleNodeType.Leaf]),
            this.stem,
            this.commitment.bytes(),
            this.c1.bytes(),
            this.c2.bytes(),
            ...this.values,
        ];
    }
    setDepth(depth) {
        this.depth = depth;
    }
}
exports.LeafNode = LeafNode;
//# sourceMappingURL=leafNode.js.map