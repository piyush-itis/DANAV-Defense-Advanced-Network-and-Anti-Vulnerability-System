import { KeyEncoding, ValueEncoding } from '@nomicfoundation/ethereumjs-util';
import { HEADS_KEY, HEAD_BLOCK_KEY, HEAD_HEADER_KEY, bodyKey, hashToNumberKey, headerKey, numberToHashKey, tdKey, } from './constants.js';
export var DBTarget;
(function (DBTarget) {
    DBTarget[DBTarget["Heads"] = 0] = "Heads";
    DBTarget[DBTarget["HeadHeader"] = 1] = "HeadHeader";
    DBTarget[DBTarget["HeadBlock"] = 2] = "HeadBlock";
    DBTarget[DBTarget["HashToNumber"] = 3] = "HashToNumber";
    DBTarget[DBTarget["NumberToHash"] = 4] = "NumberToHash";
    DBTarget[DBTarget["TotalDifficulty"] = 5] = "TotalDifficulty";
    DBTarget[DBTarget["Body"] = 6] = "Body";
    DBTarget[DBTarget["Header"] = 7] = "Header";
    DBTarget[DBTarget["CliqueSignerStates"] = 8] = "CliqueSignerStates";
    DBTarget[DBTarget["CliqueVotes"] = 9] = "CliqueVotes";
    DBTarget[DBTarget["CliqueBlockSigners"] = 10] = "CliqueBlockSigners";
})(DBTarget || (DBTarget = {}));
/**
 * The DBOp class aids creating database operations which is used by `level` using a more high-level interface
 */
export class DBOp {
    constructor(operationTarget, key) {
        this.operationTarget = operationTarget;
        this.baseDBOp = {
            key: '',
            keyEncoding: KeyEncoding.Bytes,
            valueEncoding: ValueEncoding.Bytes,
        };
        switch (operationTarget) {
            case DBTarget.Heads: {
                this.baseDBOp.key = HEADS_KEY;
                this.baseDBOp.valueEncoding = ValueEncoding.JSON;
                break;
            }
            case DBTarget.HeadHeader: {
                this.baseDBOp.key = HEAD_HEADER_KEY;
                this.baseDBOp.keyEncoding = KeyEncoding.String;
                break;
            }
            case DBTarget.HeadBlock: {
                this.baseDBOp.key = HEAD_BLOCK_KEY;
                this.baseDBOp.keyEncoding = KeyEncoding.String;
                break;
            }
            case DBTarget.HashToNumber: {
                this.baseDBOp.key = hashToNumberKey(key.blockHash);
                this.cacheString = 'hashToNumber';
                break;
            }
            case DBTarget.NumberToHash: {
                this.baseDBOp.key = numberToHashKey(key.blockNumber);
                this.cacheString = 'numberToHash';
                break;
            }
            case DBTarget.TotalDifficulty: {
                this.baseDBOp.key = tdKey(key.blockNumber, key.blockHash);
                this.cacheString = 'td';
                break;
            }
            case DBTarget.Body: {
                this.baseDBOp.key = bodyKey(key.blockNumber, key.blockHash);
                this.cacheString = 'body';
                break;
            }
            case DBTarget.Header: {
                this.baseDBOp.key = headerKey(key.blockNumber, key.blockHash);
                this.cacheString = 'header';
                break;
            }
        }
    }
    static get(operationTarget, key) {
        return new DBOp(operationTarget, key);
    }
    // set operation: note: value/key is not in default order
    static set(operationTarget, value, key) {
        const dbOperation = new DBOp(operationTarget, key);
        dbOperation.baseDBOp.value = value;
        dbOperation.baseDBOp.type = 'put';
        if (operationTarget === DBTarget.Heads) {
            dbOperation.baseDBOp.valueEncoding = ValueEncoding.JSON;
        }
        else {
            dbOperation.baseDBOp.valueEncoding = ValueEncoding.Bytes;
        }
        return dbOperation;
    }
    static del(operationTarget, key) {
        const dbOperation = new DBOp(operationTarget, key);
        dbOperation.baseDBOp.type = 'del';
        return dbOperation;
    }
    updateCache(cacheMap) {
        if (this.cacheString !== undefined && cacheMap[this.cacheString] !== undefined) {
            if (this.baseDBOp.type === 'put') {
                this.baseDBOp.value instanceof Uint8Array &&
                    cacheMap[this.cacheString].set(this.baseDBOp.key, this.baseDBOp.value);
            }
            else if (this.baseDBOp.type === 'del') {
                cacheMap[this.cacheString].del(this.baseDBOp.key);
            }
            else {
                throw new Error('unsupported db operation on cache');
            }
        }
    }
}
//# sourceMappingURL=operation.js.map