"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile08 = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const rustbn_wasm_1 = require("rustbn-wasm");
const evm_js_1 = require("../evm.js");
function precompile08(opts) {
    const inputData = opts.data;
    // no need to care about non-divisible-by-192, because bn128.pairing will properly fail in that case
    const inputDataSize = BigInt(Math.floor(inputData.length / 192));
    const gasUsed = opts.common.param('gasPrices', 'ecPairing') +
        inputDataSize * opts.common.param('gasPrices', 'ecPairingWord');
    if (opts._debug !== undefined) {
        opts._debug(`Run ECPAIRING (0x08) precompile data=${(0, ethereumjs_util_1.short)(opts.data)} length=${opts.data.length} gasLimit=${opts.gasLimit} gasUsed=${gasUsed}`);
    }
    if (opts.gasLimit < gasUsed) {
        if (opts._debug !== undefined) {
            opts._debug(`ECPAIRING (0x08) failed: OOG`);
        }
        return (0, evm_js_1.OOGResult)(opts.gasLimit);
    }
    const returnData = (0, ethereumjs_util_1.hexToBytes)((0, rustbn_wasm_1.ec_pairing)((0, ethereumjs_util_1.bytesToUnprefixedHex)(inputData)));
    // check ecpairing success or failure by comparing the output length
    if (returnData.length !== 32) {
        if (opts._debug !== undefined) {
            opts._debug(`ECPAIRING (0x08) failed: OOG`);
        }
        // TODO: should this really return OOG?
        return (0, evm_js_1.OOGResult)(opts.gasLimit);
    }
    if (opts._debug !== undefined) {
        opts._debug(`ECPAIRING (0x08) return value=${(0, ethereumjs_util_1.bytesToHex)(returnData)}`);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: returnData,
    };
}
exports.precompile08 = precompile08;
//# sourceMappingURL=08-ecpairing.js.map