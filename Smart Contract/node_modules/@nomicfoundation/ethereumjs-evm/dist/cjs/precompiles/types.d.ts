/// <reference types="debug" />
import type { EVMInterface, ExecResult } from '../types.js';
import type { Common } from '@nomicfoundation/ethereumjs-common';
export interface PrecompileFunc {
    (input: PrecompileInput): Promise<ExecResult> | ExecResult;
}
export interface PrecompileInput {
    data: Uint8Array;
    gasLimit: bigint;
    common: Common;
    _EVM: EVMInterface;
    _debug?: debug.Debugger;
}
//# sourceMappingURL=types.d.ts.map