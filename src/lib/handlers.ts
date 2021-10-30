import * as CONSTANTS from './constants';
import mod from '../../../rust-projects/transform_recryption/wasm-code/pkg/wasm_code_bg.wasm';
import { browser } from '$app/env';

let config: { [Key: string]: any } = {};
let wasmWallet;
let host;
let connected = false;

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
	console.log({ url });
	return await initFunction(url);
}

function assertReady() {
	return wasmWallet && connected ? true : false;
}

export const handlers: { [Key: string]: Function } = {
	initialize: async () => {
		if (!host) return new Error('Host not set. Run setHost($page.host) first.');
		wasmWallet = await import('../../../rust-projects/transform_recryption/wasm-code/pkg');
		await initModule(mod, wasmWallet.default);
		return { status: CONSTANTS.INITIALIZED };
	},

	setConfig(key: string, value: any) {
		config[key] = value;
	},

	getConfig() {
		return config;
	},

	connect: (origin) => {
		if (window.confirm(`Authorize ${origin} to connect to your wallet?`)) {
			connected = true;
			const ret = { status: CONSTANTS.CONNECTED, message: 'Wallet connected!' };
			return ret;
		} else {
			return { status: CONSTANTS.DISCONNECTED, message: 'Connection denied' };
		}
	},

	generate_ed25519_keypair: () => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		let keypair = wasmWallet.generate_ed25519_keypair();
		let publicKey = keypair.public();
		let secretKey = keypair.secret();
		return { publicKey, secretKey };
	},

	newProxcryptor: (pre_name, secretKey) => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		if (!(pre && pre_name && pre.get(pre_name)))
			return new Error('No proxy encryptor available for this name.');
		pre.set(pre_name, wasmWallet.Proxcryptor.new(secretKey));
		return pre_name;
	},

	selfEncrypt: (pre_name, data, tag) => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		if (!(pre && pre_name && pre.get(pre_name)))
			return new Error('No proxy encryptor available for this name.');
		let encrypted_message = pre.get(pre_name).self_encrypt(data, tag); // data, tag
		return encrypted_message;
	},

	generateReKey: (pre_name, targetPublicKey, tag) => {
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

	reDecrypt: (pre_name, re_encrypted_message) => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		if (!(pre && pre_name && pre.get(pre_name)))
			return new Error('No proxy encryptor available for this name.');
		let reDecryptedMsg = pre.get(pre_name).re_decrypt(re_encrypted_message);
		return reDecryptedMsg; // textDecoder.decode(reDecryptedMsg);
	}
};
