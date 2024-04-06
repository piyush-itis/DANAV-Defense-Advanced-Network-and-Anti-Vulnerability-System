"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile04 = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const evm_js_1 = require("../evm.js");
function precompile04(opts) {
    const data = opts.data;
    let gasUsed = opts.common.param('gasPrices', 'identity');
    gasUsed += opts.common.param('gasPrices', 'identityWord') * BigInt(Math.ceil(data.length / 32));
    if (opts._debug !== undefined) {
        opts._debug(`Run IDENTITY (0x04) precompile data=${(0, ethereumjs_util_1.short)(opts.data)} length=${opts.data.length} gasLimit=${opts.gasLimit} gasUsed=${gasUsed}`);
    }
    if (opts.gasLimit < gasUsed) {
        if (opts._debug !== undefined) {
            opts._debug(`IDENTITY (0x04) failed: OOG`);
        }
        return (0, evm_js_1.OOGResult)(opts.gasLimit);
    }
    if (opts._debug !== undefined) {
        opts._debug(`IDENTITY (0x04) return data=${(0, ethereumjs_util_1.short)(opts.data)}`);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: Uint8Array.from(data), // Copy the memory (`Uint8Array.from()`)
    };
}
exports.precompile04 = precompile04;
//# sourceMappingURL=04-identity.js.map