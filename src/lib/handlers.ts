import * as CONSTANTS from './constants';
import mod from '../../../rust-projects/transform_recryption/wasm-code/pkg/wasm_code_bg.wasm';
import { browser } from '$app/env';

interface EncryptedMessage {
	tag: Uint8Array;
	encrypted_key: Uint8Array; // length = 32
	encrypted_data: Uint8Array;
	message_checksum: Uint8Array;
	overall_checksum: Uint8Array;
}

let config: { [Key: string]: any } = {};
let wasmWallet;
let host;
let connected = false;
let DEFAULT_NAME = 'DEFAULT_NAME';

let pre = new Map();

export const setHost = (h) => {
	host = h;
};

// inspired by https://github.com/doomnoodles/sveltekit-rust-ssr-template/blob/sveltekit-rust-ssr-template-buggy-branch/src/routes/index.svelte
async function initModule(viteInitModuleFunction, initFunction) {
	let functionString = viteInitModuleFunction.toString();
	const quoteIndex = functionString.indexOf('"');
	const relUrl = quoteIndex !== -1 ? functionString.slice(quoteIndex + 1, -2) : functionString;
	// this line is crucial for ssr, because node doesn't understand relative urls
	const url = browser ? relUrl : `http://${host}` + relUrl; // TODO: find a way to derive the localhost part dynamically
	return await initFunction(url);
}

function assertReady() {
	return wasmWallet && connected ? true : false;
}

export let handlers: { [Key: string]: Function } = {
	initialize: async () => {
		if (!host) return new Error('Host not set. Run setHost($page.host) first.');
		wasmWallet = await import('../../../rust-projects/transform_recryption/wasm-code/pkg');
		await initModule(mod, wasmWallet.default);
		return { status: CONSTANTS.INITIALIZED };
	},

	setConfig: (key: string, value: any) => {
		config[key] = value;
	},

	getConfig: () => {
		return config;
	},

	connect: (origin) => {
		if (window.confirm(`Authorize ${origin} to connect to your wallet?`)) {
			connected = true;
			const ret = { status: CONSTANTS.CONNECTED, message: 'Wallet connected!' };
			return ret;
		} else {
			return false // { status: CONSTANTS.DISCONNECTED, message: 'Connection denied' };
		}
	},

	generate: (pre_name = DEFAULT_NAME) => {
		const { publicKey, secretKey } = handlers.generateEd25519Keypair();
		return handlers.newProxcryptor(secretKey, pre_name);
	},

	generateEd25519Keypair: () => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		let keypair = wasmWallet.generate_ed25519_keypair();
		let publicKey = keypair.public();
		let secretKey = keypair.secret();
		return { publicKey, secretKey };
	},

	newProxcryptor: (secretKey, pre_name = DEFAULT_NAME) => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		pre.set(pre_name, wasmWallet.Proxcryptor.new(secretKey));
		return pre_name;
	},

	getLoadedKeys: () => {
		let results = [];
		for (let name of pre.keys()) {
			results.push({
				name,
				publicKey: handlers.getPublicKey(name),
				publicKeyBase58: handlers.getPublicKeyBase58(name)
			});
		}
		return results;
	},

	getPublicKey: (name): Uint8Array => {
		return new Uint8Array(pre.get(name).public_key());
	},

	getPublicKeyBase58: (name): string => {
		return pre.get(name).public_key_base58();
	},

	selfEncrypt: (data: Uint8Array, tag: Uint8Array, pre_name: string = DEFAULT_NAME) => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		if (!(pre && pre_name && pre.get(pre_name)))
			return new Error('No proxy encryptor available for this name.');
		let encrypted_message = pre.get(pre_name).self_encrypt(data, tag); // data, tag
		return encrypted_message;
	},

	selfDecrypt: (encryptedMessage: EncryptedMessage, pre_name: string = DEFAULT_NAME) => {
		let decrypted_message = pre.get(pre_name).self_decrypt(encryptedMessage); // data, tag
		return decrypted_message;
	},

	generateReKey: (targetPublicKey, tag, pre_name = DEFAULT_NAME) => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		if (!(pre && pre_name && pre.get(pre_name)))
			return new Error('No proxy encryptor available for this name.');
		let re_key = pre.get(pre_name).generate_re_key(targetPublicKey, tag);
		return re_key;
	},

	reEncrypt: (targetPublicKey, encrypted_message, re_key) => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);

		let re_encrypted_message = wasmWallet.Proxcryptor.re_encrypt(
			targetPublicKey,
			encrypted_message,
			re_key
		);
		return re_encrypted_message;
	},

	reDecrypt: (re_encrypted_message, pre_name = DEFAULT_NAME) => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		if (!(pre && pre_name && pre.get(pre_name)))
			return new Error('No proxy encryptor available for this name.');
		let decrypted = pre.get(pre_name).re_decrypt(re_encrypted_message);
		let textDecoder = new TextDecoder();
		return textDecoder.decode(new Uint8Array(decrypted));
	}
};
