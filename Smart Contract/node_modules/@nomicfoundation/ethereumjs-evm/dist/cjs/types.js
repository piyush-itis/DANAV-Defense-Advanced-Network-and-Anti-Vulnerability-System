"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultBlockchain = void 0;
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
class DefaultBlockchain {
    async getBlock() {
        return {
            hash() {
                return (0, ethereumjs_util_1.zeros)(32);
            },
        };
    }
    shallowCopy() {
        return this;
    }
}
exports.DefaultBlockchain = DefaultBlockchain;
//# sourceMappingURL=types.js.map