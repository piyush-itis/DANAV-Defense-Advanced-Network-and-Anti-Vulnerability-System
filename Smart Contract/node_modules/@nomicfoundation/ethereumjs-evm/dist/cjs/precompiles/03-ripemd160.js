"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile03 = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const ripemd160_js_1 = require("ethereum-cryptography/ripemd160.js");
const evm_js_1 = require("../evm.js");
function precompile03(opts) {
    const data = opts.data;
    let gasUsed = opts.common.param('gasPrices', 'ripemd160');
    gasUsed += opts.common.param('gasPrices', 'ripemd160Word') * BigInt(Math.ceil(data.length / 32));
    if (opts._debug !== undefined) {
        opts._debug(`Run RIPEMD160 (0x03) precompile data=${(0, ethereumjs_util_1.short)(opts.data)} length=${opts.data.length} gasLimit=${opts.gasLimit} gasUsed=${gasUsed}`);
    }
    if (opts.gasLimit < gasUsed) {
        if (opts._debug !== undefined) {
            opts._debug(`RIPEMD160 (0x03) failed: OOG`);
        }
        return (0, evm_js_1.OOGResult)(opts.gasLimit);
    }
    const hash = (0, ethereumjs_util_1.setLengthLeft)((0, ripemd160_js_1.ripemd160)(Buffer.from(data)), 32);
    if (opts._debug !== undefined) {
        opts._debug(`RIPEMD160 (0x03) return hash=${(0, ethereumjs_util_1.bytesToHex)(hash)}`);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: (0, ethereumjs_util_1.setLengthLeft)((0, ripemd160_js_1.ripemd160)(Buffer.from(data)), 32),
    };
}
exports.precompile03 = precompile03;
//# sourceMappingURL=03-ripemd160.js.map