// import { JWKInterface, JWKPublicInterface } from 'arweave/wallet';
import * as ArweaveUtils from './utils';
import { confirm, keypairs } from '../../stores';
import { get } from 'svelte/store';
let storedPermissions;
const jwkToCryptoKey = async (jwk) => {
    return crypto.subtle.importKey('jwk', jwk, {
        name: 'RSA-PSS',
        hash: {
            name: 'SHA-256'
        }
    }, false, ['sign']);
};
const subtleSign = async (jwk, data, { saltLength } = {}) => {
    let signature = await crypto.subtle.sign({
        name: 'RSA-PSS',
        saltLength: 32
    }, await jwkToCryptoKey(jwk), data);
    return new Uint8Array(signature);
};
const generateJWK = async () => {
    let cryptoKey = await crypto.subtle.generateKey({
        name: 'RSA-PSS',
        modulusLength: 4096,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {
            name: 'SHA-256'
        }
    }, true, ['sign']);
    let jwk = await crypto.subtle.exportKey('jwk', cryptoKey.privateKey);
    const kid = await ownerToAddress(jwk.n);
    // RSA key parameters
    // https://www.gnupg.org/documentation/manuals/gcrypt-devel/RSA-key-parameters.html
    return {
        kty: jwk.kty,
        e: jwk.e,
        n: jwk.n,
        d: jwk.d,
        p: jwk.p,
        q: jwk.q,
        dp: jwk.dp,
        dq: jwk.dq,
        qi: jwk.qi,
        kid
    };
};
async function publicKeytoJWK(publicModulus) {
    const publicKeyJWK = {
        kty: 'RSA',
        e: 'AQAB',
        n: publicModulus
    };
    // await ownerToAddress(publicKeyJWK.n);
    return publicKey;
}
async function ownerToAddress(owner) {
    return ArweaveUtils.bufferTob64Url(await crypto.subtle.digest('SHA-256', ArweaveUtils.b64UrlToBuffer(owner)));
}
export const arweaveWalletAPI = {
    generateJWK: async () => {
        const jwk = await generateJWK();
        const address = await ownerToAddress(jwk.n);
        // add key to keychain?
        // $keys = [$keys, { address: jwk }];
        return jwk;
    },
    // API from https://github.com/th8ta/ArConnect/blob/main/src/scripts/injected.ts
    async connect(permissions, appInfo = {}) {
        storedPermissions = permissions;
        // I don't get why this step is needed, we will confirm each signature anyway
        // skip it
        // alert('ar handler connect');
        return true;
    },
    async disconnect() {
        return true;
    },
    async getActiveAddress() {
        try {
            let jwk;
            const kp = get(keypairs); // svelte stores
            // find the RSA key
            kp.forEach((value, key, map) => {
                if (value.kty == 'RSA') {
                    jwk = value;
                }
            });
            const addr = await ownerToAddress(jwk.n);
            return addr;
        }
        catch (e) {
            throw new Error(e);
        }
    },
    async getActivePublicKey() {
        // TODO
    },
    async getAllAddresses() {
        // TODO
    },
    async getWalletNames() {
        // TODO
    },
    async addToken(id) {
        // TODO
    },
    async sign(params) {
        console.log(`sign with params`, { params });
        let confirmed = await get(confirm)('arweaveWalletAPI.sign', params);
        if (!confirmed)
            return false;
        const address = await arweaveWalletAPI.getActiveAddress();
        // get keys
        let jwk;
        const kp = get(keypairs); // svelte stores
        // find the RSA key
        await Promise.all([...kp].map(async ([k, value]) => {
            if (value?.kty === 'RSA') {
                const addr = await ownerToAddress(value.n);
                if (addr == address) {
                    jwk = value;
                }
            }
        }));
        // pull out RSA matching jwk.n
        const rawSig = await subtleSign(jwk, params.dataToSign);
        return rawSig;
    },
    async getPermissions() {
        const permissions = storedPermissions;
        return permissions;
    },
    async getArweaveConfig() {
        // TODO
    },
    async encrypt(data, options) {
        // TODO
    },
    async decrypt(data, options) {
        // TODO
    },
    async signature(data, algorithm) {
        // TODO
    },
    noop: () => { }
};
