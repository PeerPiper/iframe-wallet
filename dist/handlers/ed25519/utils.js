import * as B64 from 'base64-js';
export function jwkToSecretBytes(jwk) {
    return B64.toByteArray(jwk.d);
}
// private JWK is simply the private key as d and x
export const privateKeyJwkFromEd25519bytes = async (ed25519secretKey, ed25519publicKey) => {
    const jwk = {
        crv: 'Ed25519',
        d: B64.fromByteArray(ed25519secretKey),
        x: B64.fromByteArray(ed25519publicKey),
        kty: 'OKP'
    };
    const kid = await getKid(jwk);
    return {
        ...jwk,
        kid
    };
};
export const publicKeyJwkFromPublicKey = async (ed25519publicKey) => {
    const jwk = {
        crv: 'Ed25519',
        x: B64.fromByteArray(ed25519publicKey),
        kty: 'OKP' // EC is only P-256 etc. Ex: https://github.com/sicpa-dlab/didcomm-rust/blob/main/src/utils/did.rs#L37 && https://github.com/panva/jose/blob/main/src/jwk/thumbprint.ts#L44
    };
    const kid = await getKid(jwk);
    return {
        ...jwk,
        kid
    };
};
const getKid = async (jwk) => {
    const copy = { ...jwk };
    delete copy.d;
    delete copy.kid;
    delete copy.alg;
    const uint8array = new TextEncoder('utf-16').encode(canonicalize(copy));
    const digest = await crypto.subtle.digest('SHA-256', uint8array);
    return B64.fromByteArray(new Uint8Array(digest));
};
function canonicalize(object) {
    if (object === null || typeof object !== 'object' || object.toJSON != null) {
        return JSON.stringify(object);
    }
    if (Array.isArray(object)) {
        return ('[' +
            object.reduce((t, cv, ci) => {
                const comma = ci === 0 ? '' : ',';
                const value = cv === undefined || typeof cv === 'symbol' ? null : cv;
                return t + comma + canonicalize(value);
            }, '') +
            ']');
    }
    return ('{' +
        Object.keys(object)
            .sort()
            .reduce((t, cv, ci) => {
            if (object[cv] === undefined || typeof object[cv] === 'symbol') {
                return t;
            }
            const comma = t.length === 0 ? '' : ',';
            return t + comma + canonicalize(cv) + ':' + canonicalize(object[cv]);
        }, '') +
        '}');
}
