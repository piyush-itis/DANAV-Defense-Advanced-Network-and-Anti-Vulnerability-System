import { type Address } from '@nomicfoundation/ethereumjs-util';
import type { PrecompileFunc, PrecompileInput } from './types.js';
import type { Common } from '@nomicfoundation/ethereumjs-common';
interface PrecompileEntry {
    address: string;
    check: PrecompileAvailabilityCheckType;
    precompile: PrecompileFunc;
    name: string;
}
interface Precompiles {
    [key: string]: PrecompileFunc;
}
declare type PrecompileAvailabilityCheckType = PrecompileAvailabilityCheckTypeHardfork | PrecompileAvailabilityCheckTypeEIP;
declare enum PrecompileAvailabilityCheck {
    EIP = 0,
    Hardfork = 1
}
interface PrecompileAvailabilityCheckTypeHardfork {
    type: PrecompileAvailabilityCheck.Hardfork;
    param: string;
}
interface PrecompileAvailabilityCheckTypeEIP {
    type: PrecompileAvailabilityCheck.EIP;
    param: number;
}
declare const ripemdPrecompileAddress = "0000000000000000000000000000000000000003";
declare const precompileEntries: PrecompileEntry[];
declare const precompiles: Precompiles;
declare type DeletePrecompile = {
    address: Address;
};
declare type AddPrecompile = {
    address: Address;
    function: PrecompileFunc;
};
declare type CustomPrecompile = AddPrecompile | DeletePrecompile;
declare function getActivePrecompiles(common: Common, customPrecompiles?: CustomPrecompile[]): Map<string, PrecompileFunc>;
declare function getPrecompileName(addressUnprefixedStr: string): string | undefined;
export { getActivePrecompiles, getPrecompileName, precompileEntries, precompiles, ripemdPrecompileAddress, };
export type { AddPrecompile, CustomPrecompile, DeletePrecompile, PrecompileFunc, PrecompileInput };
//# sourceMappingURL=index.d.ts.map