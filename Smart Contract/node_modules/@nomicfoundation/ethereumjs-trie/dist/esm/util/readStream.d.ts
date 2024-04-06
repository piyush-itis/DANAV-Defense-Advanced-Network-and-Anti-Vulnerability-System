/// <reference types="node" />
import { ReadableStream } from 'node:stream/web';
import { Readable } from 'readable-stream';
import type { Trie } from '../trie.js';
export declare class TrieReadStream extends Readable {
    private trie;
    private _started;
    constructor(trie: Trie);
    _read(): Promise<void>;
}
export declare function asyncTrieReadStream(trie: Trie): ReadableStream<any>;
//# sourceMappingURL=readStream.d.ts.map