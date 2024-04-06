"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile07 = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const rustbn_wasm_1 = require("rustbn-wasm");
const evm_js_1 = require("../evm.js");
function precompile07(opts) {
    const inputData = (0, ethereumjs_util_1.bytesToUnprefixedHex)(opts.data.subarray(0, 128));
    const gasUsed = opts.common.param('gasPrices', 'ecMul');
    if (opts._debug !== undefined) {
        opts._debug(`Run ECMUL (0x07) precompile data=${(0, ethereumjs_util_1.short)(opts.data)} length=${opts.data.length} gasLimit=${opts.gasLimit} gasUsed=${gasUsed}`);
    }
    if (opts.gasLimit < gasUsed) {
        if (opts._debug !== undefined) {
            opts._debug(`ECMUL (0x07) failed: OOG`);
        }
        return (0, evm_js_1.OOGResult)(opts.gasLimit);
    }
    const returnData = (0, ethereumjs_util_1.hexToBytes)((0, rustbn_wasm_1.ec_mul)(inputData));
    // check ecmul success or failure by comparing the output length
    if (returnData.length !== 64) {
        if (opts._debug !== undefined) {
            opts._debug(`ECMUL (0x07) failed: OOG`);
        }
        // TODO: should this really return OOG?
        return (0, evm_js_1.OOGResult)(opts.gasLimit);
    }
    if (opts._debug !== undefined) {
        opts._debug(`ECMUL (0x07) return value=${(0, ethereumjs_util_1.bytesToHex)(returnData)}`);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: returnData,
    };
}
exports.precompile07 = precompile07;
//# sourceMappingURL=07-ecmul.js.map