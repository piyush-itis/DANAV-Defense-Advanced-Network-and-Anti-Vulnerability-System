import { RLP } from '@nomicfoundation/ethereumjs-rlp';
export class BaseVerkleNode {
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
        return RLP.encode(this.raw());
    }
}
//# sourceMappingURL=baseVerkleNode.js.map