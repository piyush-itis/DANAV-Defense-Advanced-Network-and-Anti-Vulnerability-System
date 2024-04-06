import { TransactionType } from '@nomicfoundation/ethereumjs-tx';
import { Account, Address } from '@nomicfoundation/ethereumjs-util';
import type { RunBlockOpts, RunBlockResult, TxReceipt } from './types.js';
import type { VM } from './vm.js';
import type { EVMInterface } from '@nomicfoundation/ethereumjs-evm';
/**
 * @ignore
 */
export declare function runBlock(this: VM, opts: RunBlockOpts): Promise<RunBlockResult>;
export declare function accumulateParentBeaconBlockRoot(this: VM, root: Uint8Array, timestamp: bigint): Promise<void>;
export declare function calculateMinerReward(minerReward: bigint, ommersNum: number): bigint;
export declare function rewardAccount(evm: EVMInterface, address: Address, reward: bigint): Promise<Account>;
/**
 * Returns the encoded tx receipt.
 */
export declare function encodeReceipt(receipt: TxReceipt, txType: TransactionType): Uint8Array;
//# sourceMappingURL=runBlock.d.ts.map