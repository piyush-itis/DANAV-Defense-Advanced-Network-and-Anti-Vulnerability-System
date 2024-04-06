"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ethash = exports.Miner = void 0;
const ethereumjs_block_1 = require("@nomicfoundation/ethereumjs-block");
const ethereumjs_rlp_1 = require("@nomicfoundation/ethereumjs-rlp");
const ethereumjs_util_1 = require("@nomicfoundation/ethereumjs-util");
const keccak_js_1 = require("ethereum-cryptography/keccak.js");
const util_js_1 = require("./util.js");
function xor(a, b) {
    const len = Math.max(a.length, b.length);
    const res = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        res[i] = a[i] ^ b[i];
    }
    return res;
}
class Miner {
    /**
     * Create a Miner object
     * @param mineObject - The object to mine on, either a `BlockHeader` or a `Block` object
     * @param ethash - Ethash object to use for mining
     */
    constructor(mineObject, ethash) {
        if (mineObject instanceof ethereumjs_block_1.BlockHeader) {
            this.blockHeader = mineObject;
        }
        else if (mineObject instanceof ethereumjs_block_1.Block) {
            this.block = mineObject;
            this.blockHeader = mineObject.header;
        }
        else {
            throw new Error('unsupported mineObject');
        }
        this.currentNonce = ethereumjs_util_1.BIGINT_0;
        this.ethash = ethash;
        this.stopMining = false;
    }
    /**
     * Stop the miner on the next iteration
     */
    stop() {
        this.stopMining = true;
    }
    /**
     * Iterate `iterations` time over nonces, returns a `BlockHeader` or `Block` if a solution is found, `undefined` otherwise
     * @param iterations - Number of iterations to iterate over. If `-1` is passed, the loop runs until a solution is found
     * @returns - `undefined` if no solution was found within the iterations, or a `BlockHeader` or `Block`
     *           with valid PoW based upon what was passed in the constructor
     */
    async mine(iterations = 0) {
        const solution = await this.iterate(iterations);
        if (solution) {
            if (this.block) {
                const data = this.block.toJSON();
                data.header.mixHash = solution.mixHash;
                data.header.nonce = solution.nonce;
                return ethereumjs_block_1.Block.fromBlockData(data, { common: this.block.common });
            }
            else {
                const data = this.blockHeader.toJSON();
                data.mixHash = solution.mixHash;
                data.nonce = solution.nonce;
                return ethereumjs_block_1.BlockHeader.fromHeaderData(data, { common: this.blockHeader.common });
            }
        }
    }
    /**
     * Iterate `iterations` times over nonces to find a valid PoW. Caches solution if one is found
     * @param iterations - Number of iterations to iterate over. If `-1` is passed, the loop runs until a solution is found
     * @returns - `undefined` if no solution was found, or otherwise a `Solution` object
     */
    async iterate(iterations = 0) {
        if (this.solution) {
            return this.solution;
        }
        if (!this.headerHash) {
            this.headerHash = this.ethash.headerHash(this.blockHeader.raw());
        }
        const headerHash = this.headerHash;
        const { number, difficulty } = this.blockHeader;
        await this.ethash.loadEpoc(number);
        while (iterations !== 0 && !this.stopMining) {
            // The promise/setTimeout construction is necessary to ensure we jump out of the event loop
            // Without this, for high-difficulty blocks JS never jumps out of the Promise
            const solution = await new Promise((resolve) => {
                setTimeout(() => {
                    const nonce = (0, ethereumjs_util_1.setLengthLeft)((0, ethereumjs_util_1.bigIntToBytes)(this.currentNonce), 8);
                    const a = this.ethash.run(headerHash, nonce);
                    const result = (0, ethereumjs_util_1.bytesToBigInt)(a.hash);
                    if (ethereumjs_util_1.TWO_POW256 / difficulty > result) {
                        const solution = {
                            mixHash: a.mix,
                            nonce,
                        };
                        this.solution = solution;
                        resolve(solution);
                        return;
                    }
                    this.currentNonce++;
                    iterations--;
                    resolve(null);
                }, 0);
            });
            if (solution !== null) {
                return solution;
            }
        }
    }
}
exports.Miner = Miner;
class Ethash {
    constructor(cacheDB) {
        this.dbOpts = {
            valueEncoding: 'json',
        };
        this.cacheDB = cacheDB;
        this.cache = [];
    }
    mkcache(cacheSize, seed) {
        const n = Math.floor(cacheSize / util_js_1.params.HASH_BYTES);
        const o = [(0, keccak_js_1.keccak512)(Buffer.from(seed))];
        let i;
        for (i = 1; i < n; i++) {
            o.push((0, keccak_js_1.keccak512)(o[o.length - 1]));
        }
        for (let _ = 0; _ < util_js_1.params.CACHE_ROUNDS; _++) {
            for (i = 0; i < n; i++) {
                const v = new DataView(o[i].buffer).getUint32(0, true) % n;
                o[i] = (0, keccak_js_1.keccak512)(Buffer.from(xor(o[(i - 1 + n) % n], o[v])));
            }
        }
        this.cache = o;
        return this.cache;
    }
    calcDatasetItem(i) {
        const n = this.cache.length;
        const r = Math.floor(util_js_1.params.HASH_BYTES / util_js_1.params.WORD_BYTES);
        let mix = new Uint8Array(this.cache[i % n]);
        const mixView = new DataView(mix.buffer);
        mixView.setUint32(0, mixView.getUint32(0, true) ^ i, true);
        mix = (0, keccak_js_1.keccak512)(Buffer.from(mix));
        for (let j = 0; j < util_js_1.params.DATASET_PARENTS; j++) {
            const cacheIndex = (0, util_js_1.fnv)(i ^ j, new DataView(mix.buffer).getUint32((j % r) * 4, true));
            mix = (0, util_js_1.fnvBytes)(mix, this.cache[cacheIndex % n]);
        }
        return (0, keccak_js_1.keccak512)(Buffer.from(mix));
    }
    run(val, nonce, fullSize) {
        if (fullSize === undefined) {
            if (this.fullSize === undefined) {
                throw new Error('fullSize needed');
            }
            else {
                fullSize = this.fullSize;
            }
        }
        const n = Math.floor(fullSize / util_js_1.params.HASH_BYTES);
        const w = Math.floor(util_js_1.params.MIX_BYTES / util_js_1.params.WORD_BYTES);
        const s = (0, keccak_js_1.keccak512)(Buffer.from((0, ethereumjs_util_1.concatBytes)(val, (0, util_js_1.bytesReverse)(nonce))));
        const mixhashes = Math.floor(util_js_1.params.MIX_BYTES / util_js_1.params.HASH_BYTES);
        let mix = (0, ethereumjs_util_1.concatBytes)(...Array(mixhashes).fill(s));
        let i;
        for (i = 0; i < util_js_1.params.ACCESSES; i++) {
            const p = ((0, util_js_1.fnv)(i ^ new DataView(s.buffer).getUint32(0, true), new DataView(mix.buffer).getUint32((i % w) * 4, true)) %
                Math.floor(n / mixhashes)) *
                mixhashes;
            const newdata = [];
            for (let j = 0; j < mixhashes; j++) {
                newdata.push(this.calcDatasetItem(p + j));
            }
            mix = (0, util_js_1.fnvBytes)(mix, (0, ethereumjs_util_1.concatBytes)(...newdata));
        }
        const cmix = new Uint8Array(mix.length / 4);
        const cmixView = new DataView(cmix.buffer);
        const mixView = new DataView(mix.buffer);
        for (i = 0; i < mix.length / 4; i = i + 4) {
            const a = (0, util_js_1.fnv)(mixView.getUint32(i * 4, true), mixView.getUint32((i + 1) * 4, true));
            const b = (0, util_js_1.fnv)(a, mixView.getUint32((i + 2) * 4, true));
            const c = (0, util_js_1.fnv)(b, mixView.getUint32((i + 3) * 4, true));
            cmixView.setUint32(i, c, true);
        }
        return {
            mix: cmix,
            hash: (0, keccak_js_1.keccak256)(Buffer.from((0, ethereumjs_util_1.concatBytes)(s, cmix))),
        };
    }
    cacheHash() {
        // Concatenate all the cache bytes together
        // We can't use `concatBytes` because calling `concatBytes(...this.cache)` results
        // in a `Max call stack size exceeded` error due to the spread operator pushing all
        // of the array elements onto the stack and the ethash cache can be quite large
        const length = this.cache.reduce((a, arr) => a + arr.length, 0);
        const result = new Uint8Array(length);
        for (let i = 0, pad = 0; i < this.cache.length; i++) {
            const arr = this.cache[i];
            result.set(arr, pad);
            pad += arr.length;
        }
        return (0, keccak_js_1.keccak256)(Buffer.from(result));
    }
    headerHash(rawHeader) {
        return (0, keccak_js_1.keccak256)(Buffer.from(ethereumjs_rlp_1.RLP.encode(rawHeader.slice(0, -2))));
    }
    /**
     * Loads the seed and cache given a block number.
     */
    async loadEpoc(number) {
        const epoc = (0, util_js_1.getEpoc)(number);
        if (this.epoc === epoc) {
            return;
        }
        this.epoc = epoc;
        if (!this.cacheDB) {
            throw new Error('cacheDB needed');
        }
        // gives the seed the first epoc found
        const findLastSeed = async (epoc) => {
            if (epoc === 0) {
                return [(0, ethereumjs_util_1.zeros)(32), 0];
            }
            const dbData = await this.cacheDB.get(epoc, {
                keyEncoding: ethereumjs_util_1.KeyEncoding.Number,
                valueEncoding: ethereumjs_util_1.ValueEncoding.JSON,
            });
            if (dbData !== undefined) {
                const data = {
                    cache: dbData.cache.map((el) => (0, ethereumjs_util_1.hexToBytes)(el)),
                    fullSize: dbData.fullSize,
                    cacheSize: dbData.cacheSize,
                    seed: (0, ethereumjs_util_1.hexToBytes)(dbData.seed),
                };
                return [data.seed, epoc];
            }
            else {
                return findLastSeed(epoc - 1);
            }
        };
        let data;
        const dbData = await this.cacheDB.get(epoc, {
            keyEncoding: ethereumjs_util_1.KeyEncoding.Number,
            valueEncoding: ethereumjs_util_1.ValueEncoding.JSON,
        });
        if (dbData !== undefined) {
            data = {
                cache: dbData.cache.map((el) => (0, ethereumjs_util_1.hexToBytes)(el)),
                fullSize: dbData.fullSize,
                cacheSize: dbData.cacheSize,
                seed: (0, ethereumjs_util_1.hexToBytes)(dbData.seed),
            };
        }
        if (!data) {
            this.cacheSize = await (0, util_js_1.getCacheSize)(epoc);
            this.fullSize = await (0, util_js_1.getFullSize)(epoc);
            const [seed, foundEpoc] = await findLastSeed(epoc);
            this.seed = (0, util_js_1.getSeed)(seed, foundEpoc, epoc);
            const cache = this.mkcache(this.cacheSize, this.seed);
            // store the generated cache
            await this.cacheDB.put(epoc, {
                cacheSize: this.cacheSize,
                fullSize: this.fullSize,
                seed: (0, ethereumjs_util_1.bytesToHex)(this.seed),
                cache: cache.map((el) => (0, ethereumjs_util_1.bytesToHex)(el)),
            }, {
                keyEncoding: ethereumjs_util_1.KeyEncoding.Number,
                valueEncoding: ethereumjs_util_1.ValueEncoding.JSON,
            });
        }
        else {
            this.cache = data.cache.map((a) => {
                return Uint8Array.from(a);
            });
            this.cacheSize = data.cacheSize;
            this.fullSize = data.fullSize;
            this.seed = Uint8Array.from(data.seed);
        }
    }
    /**
     * Returns a `Miner` object
     * To mine a `BlockHeader` or `Block`, use the one-liner `await ethash.getMiner(block).mine(-1)`
     * @param mineObject - Object to mine on, either a `BlockHeader` or a `Block`
     * @returns - A miner object
     */
    getMiner(mineObject) {
        return new Miner(mineObject, this);
    }
    async _verifyPOW(header) {
        const headerHash = this.headerHash(header.raw());
        const { number, difficulty, mixHash, nonce } = header;
        await this.loadEpoc(number);
        const a = this.run(headerHash, nonce);
        const result = (0, ethereumjs_util_1.bytesToBigInt)(a.hash);
        return (0, ethereumjs_util_1.equalsBytes)(a.mix, mixHash) && ethereumjs_util_1.TWO_POW256 / difficulty > result;
    }
    async verifyPOW(block) {
        // don't validate genesis blocks
        if (block.header.isGenesis()) {
            return true;
        }
        const valid = await this._verifyPOW(block.header);
        if (!valid) {
            return false;
        }
        for (let index = 0; index < block.uncleHeaders.length; index++) {
            const valid = await this._verifyPOW(block.uncleHeaders[index]);
            if (!valid) {
                return false;
            }
        }
        return true;
    }
}
exports.Ethash = Ethash;
//# sourceMappingURL=index.js.map