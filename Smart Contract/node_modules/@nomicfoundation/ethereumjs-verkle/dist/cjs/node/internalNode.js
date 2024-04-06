"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalNode = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const crypto_js_1 = require("../util/crypto.js");
const baseVerkleNode_js_1 = require("./baseVerkleNode.js");
const leafNode_js_1 = require("./leafNode.js");
const types_js_1 = require("./types.js");
class InternalNode extends baseVerkleNode_js_1.BaseVerkleNode {
    /* TODO: options.children is not actually used here */
    constructor(options) {
        super(options);
        this.type = types_js_1.VerkleNodeType.Internal;
        this.children = options.children ?? new Array(types_js_1.NODE_WIDTH).fill(null);
        this.copyOnWrite = options.copyOnWrite ?? {};
    }
    commit() {
        throw new Error('Not implemented');
    }
    cowChild(_) {
        // Not implemented yet
    }
    setChild(index, child) {
        this.children[index] = child;
    }
    static fromRawNode(rawNode, depth) {
        const nodeType = rawNode[0][0];
        if (nodeType !== types_js_1.VerkleNodeType.Internal) {
            throw new Error('Invalid node type');
        }
        // The length of the rawNode should be the # of children, + 2 for the node type and the commitment
        if (rawNode.length !== types_js_1.NODE_WIDTH + 2) {
            throw new Error('Invalid node length');
        }
        // TODO: Generate Point from rawNode value
        const commitment = rawNode[rawNode.length - 1];
        return new InternalNode({ commitment, depth });
    }
    static create(depth) {
        const node = new InternalNode({
            commitment: crypto_js_1.POINT_IDENTITY,
            depth,
        });
        return node;
    }
    getChildren(index) {
        return this.children?.[index] ?? null;
    }
    insert(key, value, resolver) {
        const values = new Array(types_js_1.NODE_WIDTH);
        values[key[31]] = value;
        this.insertStem(key.slice(0, 31), values, resolver);
    }
    insertStem(stem, values, resolver) {
        // Index of the child pointed by the next byte in the key
        const childIndex = stem[this.depth];
        const child = this.children[childIndex];
        if (child instanceof leafNode_js_1.LeafNode) {
            this.cowChild(childIndex);
            if ((0, ethereumjs_util_1.equalsBytes)(child.stem, stem)) {
                return child.insertMultiple(stem, values);
            }
            // A new branch node has to be inserted. Depending
            // on the next byte in both keys, a recursion into
            // the moved leaf node can occur.
            const nextByteInExistingKey = child.stem[this.depth + 1];
            const newBranch = InternalNode.create(this.depth + 1);
            newBranch.cowChild(nextByteInExistingKey);
            this.children[childIndex] = newBranch;
            newBranch.children[nextByteInExistingKey] = child;
            child.depth += 1;
            const nextByteInInsertedKey = stem[this.depth + 1];
            if (nextByteInInsertedKey === nextByteInExistingKey) {
                return newBranch.insertStem(stem, values, resolver);
            }
            // Next word differs, so this was the last level.
            // Insert it directly into its final slot.
            const leafNode = leafNode_js_1.LeafNode.create(stem, values);
            leafNode.setDepth(this.depth + 2);
            newBranch.cowChild(nextByteInInsertedKey);
            newBranch.children[nextByteInInsertedKey] = leafNode;
        }
        else if (child instanceof InternalNode) {
            this.cowChild(childIndex);
            return child.insertStem(stem, values, resolver);
        }
        else {
            throw new Error('Invalid node type');
        }
    }
    // TODO: go-verkle also adds the bitlist to the raw format.
    raw() {
        throw new Error('not implemented yet');
        // return [new Uint8Array([VerkleNodeType.Internal]), ...this.children, this.commitment]
    }
}
exports.InternalNode = InternalNode;
//# sourceMappingURL=internalNode.js.map