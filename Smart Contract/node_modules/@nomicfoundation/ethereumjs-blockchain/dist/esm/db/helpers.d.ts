import { Block } from '@nomicfoundation/ethereumjs-block';
import { DBOp } from './operation.js';
import type { BlockHeader } from '@nomicfoundation/ethereumjs-block';
declare function DBSetTD(TD: bigint, blockNumber: bigint, blockHash: Uint8Array): DBOp;
declare function DBSetBlockOrHeader(blockBody: Block | BlockHeader): DBOp[];
declare function DBSetHashToNumber(blockHash: Uint8Array, blockNumber: bigint): DBOp;
declare function DBSaveLookups(blockHash: Uint8Array, blockNumber: bigint, skipNumIndex?: boolean): DBOp[];
export { DBOp, DBSaveLookups, DBSetBlockOrHeader, DBSetHashToNumber, DBSetTD };
//# sourceMappingURL=helpers.d.ts.map