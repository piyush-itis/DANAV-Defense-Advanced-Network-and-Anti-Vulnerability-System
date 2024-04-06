"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseVerkleNode = void 0;
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
class BaseVerkleNode {
    constructor(options) {
        this.commitment = options.commitment;
        this.depth = options.depth;
    }
    // Hash returns the field representation of the commitment.
    hash() {
        throw new Error('Not implemented');
    }
    /**
     * @returns the RLP serialized node
     */
    serialize() {
        return ethereumjs_rlp_1.RLP.encode(this.raw());
    }
}
exports.BaseVerkleNode = BaseVerkleNode;
//# sourceMappingURL=baseVerkleNode.js.map