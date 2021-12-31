export declare function jwkToSecretBytes(jwk: any): Uint8Array;
export declare const privateKeyJwkFromEd25519bytes: (ed25519secretKey: Uint8Array, ed25519publicKey: Uint8Array) => Promise<{
    kid: string;
    crv: string;
    d: string;
    x: string;
    kty: string;
}>;
export declare const publicKeyJwkFromPublicKey: (ed25519publicKey: Uint8Array) => Promise<{
    kid: string;
    crv: string;
    x: string;
    kty: string;
}>;
