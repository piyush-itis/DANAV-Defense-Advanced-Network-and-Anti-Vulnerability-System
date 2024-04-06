"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile02 = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const sha256_js_1 = require("ethereum-cryptography/sha256.js");
const evm_js_1 = require("../evm.js");
function precompile02(opts) {
    const data = opts.data;
    const sha256Function = opts.common.customCrypto.sha256 ?? sha256_js_1.sha256;
    let gasUsed = opts.common.param('gasPrices', 'sha256');
    gasUsed += opts.common.param('gasPrices', 'sha256Word') * BigInt(Math.ceil(data.length / 32));
    if (opts._debug !== undefined) {
        opts._debug(`Run KECCAK256 (0x02) precompile data=${(0, ethereumjs_util_1.short)(opts.data)} length=${opts.data.length} gasLimit=${opts.gasLimit} gasUsed=${gasUsed}`);
    }
    if (opts.gasLimit < gasUsed) {
        if (opts._debug !== undefined) {
            opts._debug(`KECCAK256 (0x02) failed: OOG`);
        }
        return (0, evm_js_1.OOGResult)(opts.gasLimit);
    }
    const hash = sha256Function(Buffer.from(data));
    if (opts._debug !== undefined) {
        opts._debug(`KECCAK256 (0x02) return hash=${(0, ethereumjs_util_1.bytesToHex)(hash)}`);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: hash,
    };
}
exports.precompile02 = precompile02;
//# sourceMappingURL=02-sha256.js.map