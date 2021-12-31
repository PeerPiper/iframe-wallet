import { get } from 'svelte/store';
import { keypairs } from '../../stores';
import { publicKeyJwkFromPublicKey, jwkToSecretBytes } from './utils';
import { handlers } from '../';
let wasmWallet;
export const ed25519 = {
    setWasmWallet: (w) => {
        wasmWallet = w;
    },
    // TODO: Separate the key types, ed25519, RSA, BLS, etc
    generateKeypair: () => {
        if (!assertReady())
            return new Error('Wallet not connected or initialized. Run connect() and await initialize() first.');
        let keypair = wasmWallet.generate_ed25519_keypair();
        let publicKey = keypair.public();
        let secretKey = keypair.secret();
        return { publicKey, secretKey };
    },
    sign: async (data) => {
        const message_bytes = new Uint8Array(data); // new Uint8Array();
        const pk = handlers.getPublicKey();
        const jwk = await publicKeyJwkFromPublicKey(pk);
        const kp = get(keypairs); // get keypairs from svelte stores manually since this is not a svelte file
        const secret_key = kp.get(jwk.kid);
        const secret_key_bytes = jwkToSecretBytes(secret_key); // convert from base64 to binary
        return wasmWallet.sign(secret_key_bytes, message_bytes);
    },
    // technically verify doesn't need to be done in the wallet...
    verify: (public_key, message, signature) => {
        return wasmWallet.verify(public_key, new Uint8Array(message), signature);
    }
};
function toHexString(byteArray) {
    return Array.from(byteArray, function (byte) {
        return ('0' + (byte & 0xff).toString(16)).slice(-2);
    }).join('');
}
