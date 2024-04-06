"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ripemdPrecompileAddress = exports.precompiles = exports.precompileEntries = exports.getPrecompileName = exports.getActivePrecompiles = void 0;
const ethereumjs_common_1 = require("@nomicfoundation/ethereumjs-common");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const _01_ecrecover_js_1 = require("./01-ecrecover.js");
const _02_sha256_js_1 = require("./02-sha256.js");
const _03_ripemd160_js_1 = require("./03-ripemd160.js");
const _04_identity_js_1 = require("./04-identity.js");
const _05_modexp_js_1 = require("./05-modexp.js");
const _06_ecadd_js_1 = require("./06-ecadd.js");
const _07_ecmul_js_1 = require("./07-ecmul.js");
const _08_ecpairing_js_1 = require("./08-ecpairing.js");
const _09_blake2f_js_1 = require("./09-blake2f.js");
const _0a_kzg_point_evaluation_js_1 = require("./0a-kzg-point-evaluation.js");
var PrecompileAvailabilityCheck;
(function (PrecompileAvailabilityCheck) {
    PrecompileAvailabilityCheck[PrecompileAvailabilityCheck["EIP"] = 0] = "EIP";
    PrecompileAvailabilityCheck[PrecompileAvailabilityCheck["Hardfork"] = 1] = "Hardfork";
})(PrecompileAvailabilityCheck || (PrecompileAvailabilityCheck = {}));
const ripemdPrecompileAddress = '0000000000000000000000000000000000000003';
exports.ripemdPrecompileAddress = ripemdPrecompileAddress;
const precompileEntries = [
    {
        address: '0000000000000000000000000000000000000001',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Chainstart,
        },
        precompile: _01_ecrecover_js_1.precompile01,
        name: 'ECRECOVER (0x01)',
    },
    {
        address: '0000000000000000000000000000000000000002',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Chainstart,
        },
        precompile: _02_sha256_js_1.precompile02,
        name: 'SHA256 (0x02)',
    },
    {
        address: '0000000000000000000000000000000000000003',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Chainstart,
        },
        precompile: _03_ripemd160_js_1.precompile03,
        name: 'RIPEMD160 (0x03)',
    },
    {
        address: '0000000000000000000000000000000000000004',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Chainstart,
        },
        precompile: _04_identity_js_1.precompile04,
        name: 'Identity (0x04)',
    },
    {
        address: '0000000000000000000000000000000000000005',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Byzantium,
        },
        precompile: _05_modexp_js_1.precompile05,
        name: 'MODEXP (0x05)',
    },
    {
        address: '0000000000000000000000000000000000000006',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Byzantium,
        },
        precompile: _06_ecadd_js_1.precompile06,
        name: 'ECADD (0x06)',
    },
    {
        address: '0000000000000000000000000000000000000007',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Byzantium,
        },
        precompile: _07_ecmul_js_1.precompile07,
        name: 'ECMUL (0x07)',
    },
    {
        address: '0000000000000000000000000000000000000008',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Byzantium,
        },
        precompile: _08_ecpairing_js_1.precompile08,
        name: 'ECPAIR (0x08)',
    },
    {
        address: '0000000000000000000000000000000000000009',
        check: {
            type: PrecompileAvailabilityCheck.Hardfork,
            param: ethereumjs_common_1.Hardfork.Istanbul,
        },
        precompile: _09_blake2f_js_1.precompile09,
        name: 'BLAKE2f (0x09)',
    },
    {
        address: '000000000000000000000000000000000000000a',
        check: {
            type: PrecompileAvailabilityCheck.EIP,
            param: 4844,
        },
        precompile: _0a_kzg_point_evaluation_js_1.precompile0a,
        name: 'KZG (0x0a)',
    },
];
exports.precompileEntries = precompileEntries;
const precompiles = {
    '0000000000000000000000000000000000000001': _01_ecrecover_js_1.precompile01,
    '0000000000000000000000000000000000000002': _02_sha256_js_1.precompile02,
    [ripemdPrecompileAddress]: _03_ripemd160_js_1.precompile03,
    '0000000000000000000000000000000000000004': _04_identity_js_1.precompile04,
    '0000000000000000000000000000000000000005': _05_modexp_js_1.precompile05,
    '0000000000000000000000000000000000000006': _06_ecadd_js_1.precompile06,
    '0000000000000000000000000000000000000007': _07_ecmul_js_1.precompile07,
    '0000000000000000000000000000000000000008': _08_ecpairing_js_1.precompile08,
    '0000000000000000000000000000000000000009': _09_blake2f_js_1.precompile09,
    '000000000000000000000000000000000000000a': _0a_kzg_point_evaluation_js_1.precompile0a,
};
exports.precompiles = precompiles;
function getActivePrecompiles(common, customPrecompiles) {
    const precompileMap = new Map();
    if (customPrecompiles) {
        for (const precompile of customPrecompiles) {
            precompileMap.set((0, ethereumjs_util_1.bytesToUnprefixedHex)(precompile.address.bytes), 'function' in precompile ? precompile.function : undefined);
        }
    }
    for (const entry of precompileEntries) {
        if (precompileMap.has(entry.address)) {
            continue;
        }
        const type = entry.check.type;
        if ((type === PrecompileAvailabilityCheck.Hardfork && common.gteHardfork(entry.check.param)) ||
            (entry.check.type === PrecompileAvailabilityCheck.EIP &&
                common.isActivatedEIP(entry.check.param))) {
            precompileMap.set(entry.address, entry.precompile);
        }
    }
    return precompileMap;
}
exports.getActivePrecompiles = getActivePrecompiles;
function getPrecompileName(addressUnprefixedStr) {
    for (const entry of precompileEntries) {
        if (entry.address === addressUnprefixedStr) {
            return entry.name;
        }
    }
}
exports.getPrecompileName = getPrecompileName;
//# sourceMappingURL=index.js.map