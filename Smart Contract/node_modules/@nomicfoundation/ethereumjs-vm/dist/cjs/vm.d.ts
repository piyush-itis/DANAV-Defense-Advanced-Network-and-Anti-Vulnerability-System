import { Common } from '@nomicfoundation/ethereumjs-common';
import { AsyncEventEmitter } from '@nomicfoundation/ethereumjs-util';
import type { BlockBuilder } from './buildBlock.js';
import type { BuildBlockOpts, RunBlockOpts, RunBlockResult, RunTxOpts, RunTxResult, VMEvents, VMOpts } from './types.js';
import type { BlockchainInterface } from '@nomicfoundation/ethereumjs-blockchain';
import type { EVMStateManagerInterface } from '@nomicfoundation/ethereumjs-common';
import type { EVMInterface } from '@nomicfoundation/ethereumjs-evm';
import type { EVMPerformanceLogOutput } from '@nomicfoundation/ethereumjs-evm/dist/cjs/logger.js';
import type { BigIntLike, GenesisState } from '@nomicfoundation/ethereumjs-util';
/**
 * Execution engine which can be used to run a blockchain, individual
 * blocks, individual transactions, or snippets of EVM bytecode.
 *
 * This class is an AsyncEventEmitter, please consult the README to learn how to use it.
 */
export declare class VM {
    /**
     * The StateManager used by the VM
     */
    readonly stateManager: EVMStateManagerInterface;
    /**
     * The blockchain the VM operates on
     */
    readonly blockchain: BlockchainInterface;
    readonly common: Common;
    readonly events: AsyncEventEmitter<VMEvents>;
    /**
     * The EVM used for bytecode execution
     */
    readonly evm: EVMInterface;
    protected readonly _opts: VMOpts;
    protected _isInitialized: boolean;
    protected readonly _setHardfork: boolean | BigIntLike;
    /**
     * Cached emit() function, not for public usage
     * set to public due to implementation internals
     * @hidden
     */
    readonly _emit: (topic: string, data: any) => Promise<void>;
    /**
     * VM is run in DEBUG mode (default: false)
     * Taken from DEBUG environment variable
     *
     * Safeguards on debug() calls are added for
     * performance reasons to avoid string literal evaluation
     * @hidden
     */
    readonly DEBUG: boolean;
    /**
     * VM async constructor. Creates engine instance and initializes it.
     *
     * @param opts VM engine constructor options
     */
    static create(opts?: VMOpts): Promise<VM>;
    /**
     * Instantiates a new {@link VM} Object.
     *
     * @deprecated The direct usage of this constructor is discouraged since
     * non-finalized async initialization might lead to side effects. Please
     * use the async {@link VM.create} constructor instead (same API).
     * @param opts
     */
    protected constructor(opts?: VMOpts);
    init({ genesisState }?: {
        genesisState?: GenesisState;
    }): Promise<void>;
    /**
     * Processes the `block` running all of the transactions it contains and updating the miner's account
     *
     * This method modifies the state. If `generate` is `true`, the state modifications will be
     * reverted if an exception is raised. If it's `false`, it won't revert if the block's header is
     * invalid. If an error is thrown from an event handler, the state may or may not be reverted.
     *
     * @param {RunBlockOpts} opts - Default values for options:
     *  - `generate`: false
     */
    runBlock(opts: RunBlockOpts): Promise<RunBlockResult>;
    /**
     * Process a transaction. Run the vm. Transfers eth. Checks balances.
     *
     * This method modifies the state. If an error is thrown, the modifications are reverted, except
     * when the error is thrown from an event handler. In the latter case the state may or may not be
     * reverted.
     *
     * @param {RunTxOpts} opts
     */
    runTx(opts: RunTxOpts): Promise<RunTxResult>;
    /**
     * Build a block on top of the current state
     * by adding one transaction at a time.
     *
     * Creates a checkpoint on the StateManager and modifies the state
     * as transactions are run. The checkpoint is committed on {@link BlockBuilder.build}
     * or discarded with {@link BlockBuilder.revert}.
     *
     * @param {BuildBlockOpts} opts
     * @returns An instance of {@link BlockBuilder} with methods:
     * - {@link BlockBuilder.addTransaction}
     * - {@link BlockBuilder.build}
     * - {@link BlockBuilder.revert}
     */
    buildBlock(opts: BuildBlockOpts): Promise<BlockBuilder>;
    /**
     * Returns a copy of the {@link VM} instance.
     *
     * Note that the returned copy will share the same db as the original for the blockchain and the statemanager.
     *
     * Associated caches will be deleted and caches will be re-initialized for a more short-term focused
     * usage, being less memory intense (the statemanager caches will switch to using an ORDERED_MAP cache
     * datastructure more suitable for short-term usage, the trie node LRU cache will not be activated at all).
     * To fine-tune this behavior (if the shallow-copy-returned object has a longer life span e.g.) you can set
     * the `downlevelCaches` option to `false`.
     *
     * @param downlevelCaches Downlevel (so: adopted for short-term usage) associated state caches (default: true)
     */
    shallowCopy(downlevelCaches?: boolean): Promise<VM>;
    /**
     * Return a compact error string representation of the object
     */
    errorStr(): string;
    /**
     * Emit EVM profile logs
     * @param logs
     * @param profileTitle
     * @hidden
     */
    emitEVMProfile(logs: EVMPerformanceLogOutput[], profileTitle: string): void;
}
//# sourceMappingURL=vm.d.ts.map