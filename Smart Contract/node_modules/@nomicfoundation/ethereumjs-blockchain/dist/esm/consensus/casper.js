import { ConsensusAlgorithm } from '@nomicfoundation/ethereumjs-common';
import { BIGINT_0 } from '@nomicfoundation/ethereumjs-util';
/**
 * This class encapsulates Casper-related consensus functionality when used with the Blockchain class.
 */
export class CasperConsensus {
    constructor() {
        this.algorithm = ConsensusAlgorithm.Casper;
    }
    async genesisInit() { }
    async setup() { }
    async validateConsensus() { }
    async validateDifficulty(header) {
        if (header.difficulty !== BIGINT_0) {
            const msg = 'invalid difficulty.  PoS blocks must have difficulty 0';
            throw new Error(`${msg} ${header.errorStr()}`);
        }
    }
    async newBlock() { }
}
//# sourceMappingURL=casper.js.map