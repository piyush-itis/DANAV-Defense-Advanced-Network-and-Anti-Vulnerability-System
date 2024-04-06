"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.precompile0a = exports.BLS_MODULUS = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const evm_js_1 = require("../evm.js");
const exceptions_js_1 = require("../exceptions.js");
exports.BLS_MODULUS = BigInt('52435875175126190479447740508185965837690552500527637822603658699938581184513');
const modulusBuffer = (0, ethereumjs_util_1.setLengthLeft)((0, ethereumjs_util_1.bigIntToBytes)(exports.BLS_MODULUS), 32);
async function precompile0a(opts) {
    const gasUsed = opts.common.param('gasPrices', 'kzgPointEvaluationGasPrecompilePrice');
    if (opts._debug !== undefined) {
        opts._debug(`Run KZG_POINT_EVALUATION (0x14) precompile data=${(0, ethereumjs_util_1.short)(opts.data)} length=${opts.data.length} gasLimit=${opts.gasLimit} gasUsed=${gasUsed}`);
    }
    if (opts.gasLimit < gasUsed) {
        if (opts._debug !== undefined) {
            opts._debug(`KZG_POINT_EVALUATION (0x14) failed: OOG`);
        }
        return (0, evm_js_1.OOGResult)(opts.gasLimit);
    }
    if (opts.data.length !== 192) {
        return (0, evm_js_1.EvmErrorResult)(new exceptions_js_1.EvmError(exceptions_js_1.ERROR.INVALID_INPUT_LENGTH), opts.gasLimit);
    }
    const version = Number(opts.common.param('sharding', 'blobCommitmentVersionKzg'));
    const fieldElementsPerBlob = opts.common.param('sharding', 'fieldElementsPerBlob');
    const versionedHash = opts.data.subarray(0, 32);
    const z = opts.data.subarray(32, 64);
    const y = opts.data.subarray(64, 96);
    const commitment = opts.data.subarray(96, 144);
    const kzgProof = opts.data.subarray(144, 192);
    if ((0, ethereumjs_util_1.bytesToHex)((0, ethereumjs_util_1.computeVersionedHash)(commitment, version)) !== (0, ethereumjs_util_1.bytesToHex)(versionedHash)) {
        if (opts._debug !== undefined) {
            opts._debug(`KZG_POINT_EVALUATION (0x14) failed: INVALID_COMMITMENT`);
        }
        return (0, evm_js_1.EvmErrorResult)(new exceptions_js_1.EvmError(exceptions_js_1.ERROR.INVALID_COMMITMENT), opts.gasLimit);
    }
    if (opts._debug !== undefined) {
        opts._debug(`KZG_POINT_EVALUATION (0x14): proof verification with commitment=${(0, ethereumjs_util_1.bytesToHex)(commitment)} z=${(0, ethereumjs_util_1.bytesToHex)(z)} y=${(0, ethereumjs_util_1.bytesToHex)(y)} kzgProof=${(0, ethereumjs_util_1.bytesToHex)(kzgProof)}`);
    }
    try {
        const res = ethereumjs_util_1.kzg.verifyKzgProof(commitment, z, y, kzgProof);
        if (res === false) {
            return (0, evm_js_1.EvmErrorResult)(new exceptions_js_1.EvmError(exceptions_js_1.ERROR.INVALID_PROOF), opts.gasLimit);
        }
    }
    catch (err) {
        if (err.message.includes('C_KZG_BADARGS') === true) {
            if (opts._debug !== undefined) {
                opts._debug(`KZG_POINT_EVALUATION (0x14) failed: INVALID_INPUTS`);
            }
            return (0, evm_js_1.EvmErrorResult)(new exceptions_js_1.EvmError(exceptions_js_1.ERROR.INVALID_INPUTS), opts.gasLimit);
        }
        if (opts._debug !== undefined) {
            opts._debug(`KZG_POINT_EVALUATION (0x14) failed: Unknown error - ${err.message}`);
        }
        return (0, evm_js_1.EvmErrorResult)(new exceptions_js_1.EvmError(exceptions_js_1.ERROR.REVERT), opts.gasLimit);
    }
    // Return value - FIELD_ELEMENTS_PER_BLOB and BLS_MODULUS as padded 32 byte big endian values
    const fieldElementsBuffer = (0, ethereumjs_util_1.setLengthLeft)((0, ethereumjs_util_1.bigIntToBytes)(fieldElementsPerBlob), 32);
    if (opts._debug !== undefined) {
        opts._debug(`KZG_POINT_EVALUATION (0x14) return fieldElements=${(0, ethereumjs_util_1.bytesToHex)(fieldElementsBuffer)} modulus=${(0, ethereumjs_util_1.bytesToHex)(modulusBuffer)}`);
    }
    return {
        executionGasUsed: gasUsed,
        returnValue: (0, ethereumjs_util_1.concatBytes)(fieldElementsBuffer, modulusBuffer),
    };
}
exports.precompile0a = precompile0a;
//# sourceMappingURL=0a-kzg-point-evaluation.js.map