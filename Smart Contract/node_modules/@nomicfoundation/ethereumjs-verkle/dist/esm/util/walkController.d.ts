import { InternalNode } from '../node/index.js';
import { PrioritizedTaskExecutor } from './tasks.js';
import type { VerkleNode } from '../node/types.js';
import type { FoundNodeFunction } from '../types.js';
import type { VerkleTree } from '../verkleTree.js';
/**
 * WalkController is an interface to control how the tree is being traversed.
 */
export declare class WalkController {
    readonly onNode: FoundNodeFunction;
    readonly taskExecutor: PrioritizedTaskExecutor;
    readonly tree: VerkleTree;
    private resolve;
    private reject;
    /**
     * Creates a new WalkController
     * @param onNode - The `FoundNodeFunction` to call if a node is found.
     * @param tree - The `VerkleTree` to walk on.
     * @param poolSize - The size of the task queue.
     */
    private constructor();
    /**
     * Async function to create and start a new walk over a tree.
     * @param onNode - The `FoundNodeFunction to call if a node is found.
     * @param tree - The tree to walk on.
     * @param root - The root key to walk on.
     * @param poolSize - Task execution pool size to prevent OOM errors. Defaults to 500.
     */
    static newWalk(onNode: FoundNodeFunction, tree: VerkleTree, root: Uint8Array, poolSize?: number): Promise<void>;
    private startWalk;
    /**
     * Run all children of a node. Priority of these nodes are the key length of the children.
     * @param node - Node to retrieve all children from of and call onNode on.
     * @param key - The current `key` which would yield the `node` when trying to get this node with a `get` operation.
     */
    allChildren(node: VerkleNode, key?: Uint8Array): void;
    /**
     * Push a node to the queue. If the queue has places left for tasks, the node is executed immediately, otherwise it is queued.
     * @param nodeRef - Push a node reference to the event queue. This reference is a 32-byte keccak hash of the value corresponding to the `key`.
     * @param key - The current key.
     * @param priority - Optional priority, defaults to key length
     */
    pushNodeToQueue(nodeRef: Uint8Array, key?: Uint8Array, priority?: number): void;
    /**
     * Push the child of an internal node to the event queue.
     * @param node - The node to select a children from. Should be an InternalNode.
     * @param key - The current key which leads to the corresponding node.
     * @param childIndex - The child index to add to the event queue.
     * @param priority - Optional priority of the event, defaults to the total key length.
     */
    pushChildrenAtIndex(node: InternalNode, key: Uint8Array | undefined, childIndex: number, priority?: number): void;
    private processNode;
}
//# sourceMappingURL=walkController.d.ts.map