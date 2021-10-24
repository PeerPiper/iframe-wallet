import imp from '../../../rust-projects/transform_recryption/wasm-code/pkg';
import type { EncryptedPackage } from './types';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function encodeTag(tag: string) {
	return textEncoder.encode(tag);
}

export const wasmWallet = new Promise((resolve, reject) => {
	imp().then((wasm) => {
		resolve(wasm);
	});
});

export class Proxcryptor {
	constructor() {}

	async create(secret) {
		console.log({ wasmWallet }, { imp });
		let ctr = wasmWallet.Counter.new('b', 0);
		console.log({ ctr });

		this.prencryptor = initWasm.Proxcryptor.new(secret);
		return;
	}

	generate() {
		return new Uint8Array(64);
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
