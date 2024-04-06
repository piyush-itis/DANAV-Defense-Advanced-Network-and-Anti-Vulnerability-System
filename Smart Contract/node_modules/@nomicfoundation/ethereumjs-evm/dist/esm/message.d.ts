import { Address } from '@nomicfoundation/ethereumjs-util';
import type { PrecompileFunc } from './precompiles/index.js';
interface MessageOpts {
    to?: Address;
    value?: bigint;
    caller?: Address;
    gasLimit: bigint;
    data?: Uint8Array;
    depth?: number;
    code?: Uint8Array | PrecompileFunc;
    codeAddress?: Address;
    isStatic?: boolean;
    isCompiled?: boolean;
    salt?: Uint8Array;
    /**
     * A set of addresses to selfdestruct, see {@link Message.selfdestruct}
     */
    selfdestruct?: Set<string>;
    /**
     * Map of addresses which were created (used in EIP 6780)
     */
    createdAddresses?: Set<string>;
    delegatecall?: boolean;
    authcallOrigin?: Address;
    gasRefund?: bigint;
    blobVersionedHashes?: Uint8Array[];
}
export declare class Message {
    to?: Address;
    value: bigint;
    caller: Address;
    gasLimit: bigint;
    data: Uint8Array;
    depth: number;
    code?: Uint8Array | PrecompileFunc;
    _codeAddress?: Address;
    isStatic: boolean;
    isCompiled: boolean;
    salt?: Uint8Array;
    containerCode?: Uint8Array; /** container code for EOF1 contracts - used by CODECOPY/CODESIZE */
    /**
     * Set of addresses to selfdestruct. Key is the unprefixed address.
     */
    selfdestruct?: Set<string>;
    /**
     * Map of addresses which were created (used in EIP 6780)
     */
    createdAddresses?: Set<string>;
    delegatecall: boolean;
    /**
     * This is used to store the origin of the AUTHCALL,
     * the purpose is to figure out where `value` should be taken from (not from `caller`)
     */
    authcallOrigin?: Address;
    gasRefund: bigint;
    /**
     * List of versioned hashes if message is a blob transaction in the outer VM
     */
    blobVersionedHashes?: Uint8Array[];
    constructor(opts: MessageOpts);
    /**
     * Note: should only be called in instances where `_codeAddress` or `to` is defined.
     */
    get codeAddress(): Address;
}
export declare type MessageWithTo = Message & Pick<Required<MessageOpts>, 'to'>;
export {};
//# sourceMappingURL=message.d.ts.map