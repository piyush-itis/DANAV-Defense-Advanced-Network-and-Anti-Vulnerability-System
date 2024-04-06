import { zeros } from '@nomicfoundation/ethereumjs-util';
export class DefaultBlockchain {
    async getBlock() {
        return {
            hash() {
                return zeros(32);
            },
        };
    }
    shallowCopy() {
        return this;
    }
}
//# sourceMappingURL=types.js.map