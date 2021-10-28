import wasmWallet from '../../../rust-projects/transform_recryption/transform-encryption-wallet-wasm-bindings/pkg';
import type { EncryptedPackage } from './types';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function encodeTag(tag: string) {
	return textEncoder.encode(tag);
}

export const initialized = new Promise((resolve, reject) => {
	wasmWallet().then((wasm) => {
		resolve(wasm);
	});
});

export const generate_ed25519_keypair = async () => {
	await wasmWallet();
	console.log({ initialized });
	return wasmWallet.generate_ed25519_keypair();
};

export class Proxcryptor {
	constructor(secret) {
		this.ready = new Promise((resolve, reject) => {
			initialized.then((_) => {
				this.wasmWallet = wasmWallet;
				this.pre = wasmWallet.Proxcryptor.new(secret);
				resolve(true); // ready
			});
		});
	}

	async selfEncrypt(symmetricKey, tag) {
		const encrypted_message = await this.prencryptor.selfEncrypt(symmetricKey, tag);
		return encrypted_message;
	}

	async selfDecrypt(data) {
		const symmetricKey = await this.prencryptor.selfDecrypt(data.encryptedKey);
		return symmetricKey;
	}

	// generate reKey so proxy can re-encrypt to the target
	generateReKey(target: Uint8Array, tag: string) {
		return this.prencryptor.generateReKey(target, textEncoder.encode(tag));
	}

	//  `proxy` re-encrypts it for `target`
	reEncrypt(target, encrypted_message, reKey) {
		const re_encrypted_message = PRE.reEncrypt(target, encrypted_message, reKey, this.curve);
		return re_encrypted_message;
	}

	async reDecrypt(re_encrypted_message) {
		const re_decrypted_msg = await this.prencryptor.reDecrypt(re_encrypted_message);
		return re_decrypted_msg;
	}
}
