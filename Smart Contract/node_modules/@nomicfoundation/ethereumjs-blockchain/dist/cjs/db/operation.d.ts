import { KeyEncoding, ValueEncoding } from '@nomicfoundation/ethereumjs-util';
import type { CacheMap } from './manager.js';
export declare enum DBTarget {
    Heads = 0,
    HeadHeader = 1,
    HeadBlock = 2,
    HashToNumber = 3,
    NumberToHash = 4,
    TotalDifficulty = 5,
    Body = 6,
    Header = 7,
    CliqueSignerStates = 8,
    CliqueVotes = 9,
    CliqueBlockSigners = 10
}
/**
 * DBOpData is a type which has the purpose of holding the actual data of the Database Operation.
 * @hidden
 */
export interface DBOpData {
    type?: 'put' | 'del';
    key: Uint8Array | string;
    keyEncoding: KeyEncoding;
    valueEncoding?: ValueEncoding;
    value?: Uint8Array | object;
}
export declare type DatabaseKey = {
    blockNumber?: bigint;
    blockHash?: Uint8Array;
};
/**
 * The DBOp class aids creating database operations which is used by `level` using a more high-level interface
 */
export declare class DBOp {
    operationTarget: DBTarget;
    baseDBOp: DBOpData;
    cacheString: string | undefined;
    private constructor();
    static get(operationTarget: DBTarget, key?: DatabaseKey): DBOp;
    static set(operationTarget: DBTarget, value: Uint8Array | object, key?: DatabaseKey): DBOp;
    static del(operationTarget: DBTarget, key?: DatabaseKey): DBOp;
    updateCache(cacheMap: CacheMap): void;
}
//# sourceMappingURL=operation.d.ts.map