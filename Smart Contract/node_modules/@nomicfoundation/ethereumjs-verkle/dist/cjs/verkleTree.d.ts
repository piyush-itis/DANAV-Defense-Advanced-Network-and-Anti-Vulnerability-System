import { Lock } from '@nomicfoundation/ethereumjs-util';
import { CheckpointDB } from './db/checkpoint.js';
import { LeafNode } from './node/leafNode.js';
import { type Proof, type VerkleTreeOpts, type VerkleTreeOptsWithDefaults } from './types.js';
import type { VerkleNode } from './node/types.js';
import type { FoundNodeFunction } from './types.js';
import type { BatchDBOp, DB, PutBatch } from '@nomicfoundation/ethereumjs-util';
interface Path {
    node: VerkleNode | null;
    remaining: Uint8Array;
    stack: VerkleNode[];
}
/**
 * The basic verkle tree interface, use with `import { VerkleTree } from '@nomicfoundation/ethereumjs-verkle'`.
 */
export declare class VerkleTree {
    protected readonly _opts: VerkleTreeOptsWithDefaults;
    /** The root for an empty tree */
    EMPTY_TREE_ROOT: Uint8Array;
    /** The backend DB */
    protected _db: CheckpointDB;
    protected _hashLen: number;
    protected _lock: Lock;
    protected _root: Uint8Array;
    /**
     * Creates a new verkle tree.
     * @param opts Options for instantiating the verkle tree
     *
     * Note: in most cases, the static {@link VerkleTree.create} constructor should be used.  It uses the same API but provides sensible defaults
     */
    constructor(opts?: VerkleTreeOpts);
    static create(opts?: VerkleTreeOpts): Promise<VerkleTree>;
    database(db?: DB<Uint8Array, Uint8Array>): CheckpointDB;
    /**
     * Gets and/or Sets the current root of the `tree`
     */
    root(value?: Uint8Array | null): Uint8Array;
    /**
     * Checks if a given root exists.
     */
    checkRoot(root: Uint8Array): Promise<boolean>;
    /**
     * Gets a value given a `key`
     * @param key - the key to search for
     * @param throwIfMissing - if true, throws if any nodes are missing. Used for verifying proofs. (default: false)
     * @returns A Promise that resolves to `Uint8Array` if a value was found or `null` if no value was found.
     */
    get(key: Uint8Array, throwIfMissing?: boolean): Promise<Uint8Array | null>;
    /**
     * Stores a given `value` at the given `key` or do a delete if `value` is empty
     * (delete operations are only executed on DB with `deleteFromDB` set to `true`)
     * @param key - the key to store the value at
     * @param value - the value to store
     * @returns A Promise that resolves once value is stored.
     */
    put(key: Uint8Array, value: Uint8Array): Promise<void>;
    /**
     * Tries to find a path to the node for the given key.
     * It returns a `stack` of nodes to the closest node.
     * @param key - the search key
     * @param throwIfMissing - if true, throws if any nodes are missing. Used for verifying proofs. (default: false)
     */
    findPath(key: Uint8Array, throwIfMissing?: boolean): Promise<Path>;
    /**
     * Walks a tree until finished.
     * @param root
     * @param onFound - callback to call when a node is found. This schedules new tasks. If no tasks are available, the Promise resolves.
     * @returns Resolves when finished walking tree.
     */
    walkTree(root: Uint8Array, onFound: FoundNodeFunction): Promise<void>;
    /**
     * Tries to find the leaf node leading up to the given key, or null if not found.
     * @param key - the search key
     * @param throwIfMissing - if true, throws if any nodes are missing. Used for verifying proofs. (default: false)
     */
    findLeafNode(key: Uint8Array, throwIfMissing?: boolean): Promise<LeafNode | null>;
    /**
     * Creates the initial node from an empty tree.
     * @private
     */
    protected _createInitialNode(key: Uint8Array, value: Uint8Array): Promise<void>;
    /**
     * Retrieves a node from db by hash.
     */
    lookupNode(node: Uint8Array | Uint8Array[]): Promise<VerkleNode | null>;
    /**
     * Updates a node.
     * @private
     * @param key
     * @param value
     * @param keyRemainder
     * @param stack
     */
    protected _updateNode(k: Uint8Array, value: Uint8Array, keyRemainder: Uint8Array, stack: VerkleNode[]): Promise<void>;
    /**
     * Saves a stack of nodes to the database.
     *
     * @param key - the key. Should follow the stack
     * @param stack - a stack of nodes to the value given by the key
     * @param opStack - a stack of levelup operations to commit at the end of this function
     */
    saveStack(key: Uint8Array, stack: VerkleNode[], opStack: PutBatch<Uint8Array, Uint8Array>[]): Promise<void>;
    /**
     * Formats node to be saved by `levelup.batch`.
     * @private
     * @param node - the node to format.
     * @param topLevel - if the node is at the top level.
     * @param opStack - the opStack to push the node's data.
     * @param remove - whether to remove the node
     * @returns The node's hash used as the key or the rawNode.
     */
    _formatNode(node: VerkleNode, topLevel: boolean, opStack: PutBatch<Uint8Array, Uint8Array>, remove?: boolean): Uint8Array;
    /**
     * The given hash of operations (key additions or deletions) are executed on the tree
     * (delete operations are only executed on DB with `deleteFromDB` set to `true`)
     * @example
     * const ops = [
     *    { type: 'del', key: Uint8Array.from('father') }
     *  , { type: 'put', key: Uint8Array.from('name'), value: Uint8Array.from('Yuri Irsenovich Kim') }
     *  , { type: 'put', key: Uint8Array.from('dob'), value: Uint8Array.from('16 February 1941') }
     *  , { type: 'put', key: Uint8Array.from('spouse'), value: Uint8Array.from('Kim Young-sook') }
     *  , { type: 'put', key: Uint8Array.from('occupation'), value: Uint8Array.from('Clown') }
     * ]
     * await tree.batch(ops)
     * @param ops
     */
    batch(ops: BatchDBOp[]): Promise<void>;
    /**
     * Saves the nodes from a proof into the tree.
     * @param proof
     */
    fromProof(proof: Proof): Promise<void>;
    /**
     * Creates a proof from a tree and key that can be verified using {@link VerkleTree.verifyProof}.
     * @param key
     */
    createProof(key: Uint8Array): Promise<Proof>;
    /**
     * Verifies a proof.
     * @param rootHash
     * @param key
     * @param proof
     * @throws If proof is found to be invalid.
     * @returns The value from the key, or null if valid proof of non-existence.
     */
    verifyProof(rootHash: Uint8Array, key: Uint8Array, proof: Proof): Promise<Uint8Array | null>;
    /**
     * The `data` event is given an `Object` that has two properties; the `key` and the `value`. Both should be Uint8Arrays.
     * @return Returns a [stream](https://nodejs.org/dist/latest-v12.x/docs/api/stream.html#stream_class_stream_readable) of the contents of the `tree`
     */
    createReadStream(): any;
    /**
     * Returns a copy of the underlying tree.
     *
     * Note on db: the copy will create a reference to the
     * same underlying database.
     *
     * Note on cache: for memory reasons a copy will not
     * recreate a new LRU cache but initialize with cache
     * being deactivated.
     *
     * @param includeCheckpoints - If true and during a checkpoint, the copy will contain the checkpointing metadata and will use the same scratch as underlying db.
     */
    shallowCopy(includeCheckpoints?: boolean): VerkleTree;
    /**
     * Persists the root hash in the underlying database
     */
    persistRoot(): Promise<void>;
    /**
     * Finds all nodes that are stored directly in the db
     * (some nodes are stored raw inside other nodes)
     * called by {@link ScratchReadStream}
     * @private
     */
    protected _findDbNodes(onFound: () => void): Promise<void>;
    /**
     * Is the tree during a checkpoint phase?
     */
    hasCheckpoints(): boolean;
    /**
     * Creates a checkpoint that can later be reverted to or committed.
     * After this is called, all changes can be reverted until `commit` is called.
     */
    checkpoint(): void;
    /**
     * Commits a checkpoint to disk, if current checkpoint is not nested.
     * If nested, only sets the parent checkpoint as current checkpoint.
     * @throws If not during a checkpoint phase
     */
    commit(): Promise<void>;
    /**
     * Reverts the tree to the state it was at when `checkpoint` was first called.
     * If during a nested checkpoint, sets root to most recent checkpoint, and sets
     * parent checkpoint as current.
     */
    revert(): Promise<void>;
    /**
     * Flushes all checkpoints, restoring the initial checkpoint state.
     */
    flushCheckpoints(): void;
}
export {};
//# sourceMappingURL=verkleTree.d.ts.map