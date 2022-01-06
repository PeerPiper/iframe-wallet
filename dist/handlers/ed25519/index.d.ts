export declare const ed25519: {
    setWasmWallet: (w: any, publicKeyGetter: any) => void;
    generateKeypair: () => Error | {
        publicKey: any;
        secretKey: any;
    };
    sign: (data: Uint8Array) => Promise<any>;
    verify: (public_key: Uint8Array, message: Uint8Array, signature: Uint8Array) => any;
};
declare global {
    interface Window {
        ed25519: typeof ed25519;
    }
}
