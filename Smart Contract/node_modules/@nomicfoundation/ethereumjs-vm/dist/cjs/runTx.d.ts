import type { RunTxOpts, RunTxResult, TxReceipt } from './types.js';
import type { VM } from './vm.js';
import type { TypedTransaction } from '@nomicfoundation/ethereumjs-tx';
/**
 * @ignore
 */
export declare function runTx(this: VM, opts: RunTxOpts): Promise<RunTxResult>;
/**
 * Returns the tx receipt.
 * @param this The vm instance
 * @param tx The transaction
 * @param txResult The tx result
 * @param cumulativeGasUsed The gas used in the block including this tx
 * @param blobGasUsed The blob gas used in the tx
 * @param blobGasPrice The blob gas price for the block including this tx
 */
export declare function generateTxReceipt(this: VM, tx: TypedTransaction, txResult: RunTxResult, cumulativeGasUsed: bigint, blobGasUsed?: bigint, blobGasPrice?: bigint): Promise<TxReceipt>;
//# sourceMappingURL=runTx.d.ts.map