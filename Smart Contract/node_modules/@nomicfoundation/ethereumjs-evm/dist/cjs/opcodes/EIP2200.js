"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSstoreGasEIP2200 = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const exceptions_js_1 = require("../exceptions.js");
const EIP2929_js_1 = require("./EIP2929.js");
const util_js_1 = require("./util.js");
/**
 * Adjusts gas usage and refunds of SStore ops per EIP-2200 (Istanbul)
 *
 * @param {RunState} runState
 * @param {Uint8Array}   currentStorage
 * @param {Uint8Array}   originalStorage
 * @param {Uint8Array}   value
 * @param {Common}   common
 */
function updateSstoreGasEIP2200(runState, currentStorage, originalStorage, value, key, common) {
    // Fail if not enough gas is left
    if (runState.interpreter.getGasLeft() <= common.param('gasPrices', 'sstoreSentryGasEIP2200')) {
        (0, util_js_1.trap)(exceptions_js_1.ERROR.OUT_OF_GAS);
    }
    // Noop
    if ((0, ethereumjs_util_1.equalsBytes)(currentStorage, value)) {
        const sstoreNoopCost = common.param('gasPrices', 'sstoreNoopGasEIP2200');
        return (0, EIP2929_js_1.adjustSstoreGasEIP2929)(runState, key, sstoreNoopCost, 'noop', common);
    }
    if ((0, ethereumjs_util_1.equalsBytes)(originalStorage, currentStorage)) {
        // Create slot
        if (originalStorage.length === 0) {
            return common.param('gasPrices', 'sstoreInitGasEIP2200');
        }
        // Delete slot
        if (value.length === 0) {
            runState.interpreter.refundGas(common.param('gasPrices', 'sstoreClearRefundEIP2200'), 'EIP-2200 -> sstoreClearRefundEIP2200');
        }
        // Write existing slot
        return common.param('gasPrices', 'sstoreCleanGasEIP2200');
    }
    if (originalStorage.length > 0) {
        if (currentStorage.length === 0) {
            // Recreate slot
            runState.interpreter.subRefund(common.param('gasPrices', 'sstoreClearRefundEIP2200'), 'EIP-2200 -> sstoreClearRefundEIP2200');
        }
        else if (value.length === 0) {
            // Delete slot
            runState.interpreter.refundGas(common.param('gasPrices', 'sstoreClearRefundEIP2200'), 'EIP-2200 -> sstoreClearRefundEIP2200');
        }
    }
    if ((0, ethereumjs_util_1.equalsBytes)(originalStorage, value)) {
        if (originalStorage.length === 0) {
            // Reset to original non-existent slot
            const sstoreInitRefund = common.param('gasPrices', 'sstoreInitRefundEIP2200');
            runState.interpreter.refundGas((0, EIP2929_js_1.adjustSstoreGasEIP2929)(runState, key, sstoreInitRefund, 'initRefund', common), 'EIP-2200 -> initRefund');
        }
        else {
            // Reset to original existing slot
            const sstoreCleanRefund = common.param('gasPrices', 'sstoreCleanRefundEIP2200');
            runState.interpreter.refundGas(BigInt((0, EIP2929_js_1.adjustSstoreGasEIP2929)(runState, key, sstoreCleanRefund, 'cleanRefund', common)), 'EIP-2200 -> cleanRefund');
        }
    }
    // Dirty update
    return common.param('gasPrices', 'sstoreDirtyGasEIP2200');
}
exports.updateSstoreGasEIP2200 = updateSstoreGasEIP2200;
//# sourceMappingURL=EIP2200.js.map