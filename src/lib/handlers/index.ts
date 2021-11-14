import * as CONSTANTS from './constants';
import mod from '$lib/wasm/pkg/wasm_code_bg.wasm';
import { browser } from '$app/env';

// import plugins
import { ed25519 } from './ed25519';
import { rsa } from './rsa';
import { arweaveWalletAPI } from './arweave';

// Svelte stuff
import { tick } from 'svelte';
import { confirm, keypairs } from '../stores';
import { get } from 'svelte/store';

import { privateKeyJwkFromEd25519bytes, jwkToSecretBytes } from './ed25519/utils';

const textDecoder = new TextDecoder();

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
const stayConnected = 'stayConnected';

let pre = new Map();
let keys = new Map();

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
		wasmWallet = await import('$lib/wasm/pkg');
		await initModule(mod, wasmWallet.default);
		return { status: CONSTANTS.INITIALIZED };
	},

	setConfig: (key: string, value: any) => {
		config[key] = value;
	},

	getConfig: () => {
		return config;
	},

	connectWallet: async (origin) => {
		try {
			// get confirm from svelte stores /  { get } from 'svelte/store';
			let confirmed =
				sessionStorage.getItem(stayConnected) == 'true' || (await get(confirm)('connect', origin));

			if (!confirmed) return false;
			connected = true;
			const ret = { status: CONSTANTS.CONNECTED, message: 'Wallet connected!' };
			return ret;
		} catch (error) {
			console.warn('connect error');
			return false; // alternatively: { status: CONSTANTS.DISCONNECTED, message: 'Connection denied' };
		}
	},

	stayConnected: () => {
		window.sessionStorage.setItem(stayConnected, 'true');
	},

	disconnect: () => {
		connected = false;
		window.sessionStorage.removeItem(stayConnected);
		const ret = { status: CONSTANTS.DISCONNECTED, message: 'Wallet disconnected!' };
		return ret;
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

	importKeypairs: (imports: Array) => {
		// TODO password protect
		// foreach keypair, sort by key type (RSA, ed25519) and laod 'em up'
		imports.forEach((imported) => {
			const kp = get(keypairs); // get keypairs from svelte stores manually since this is not a svelte file
			kp.set(imported.kid, imported); // save in the map

			if (imported.crv == 'Ed25519') {
				// convert from JWK to bytes
				const bytes = jwkToSecretBytes(imported);
				handlers.newProxcryptor(bytes);
			}
			if (imported.kty == 'RSA') {
				// convert to publicJWK?
			}
		});
	},
	getLoadedKeys: () => {
		let results = [];
		// for (let name of pre.keys()) {
		// 	results.push({
		// 		name,
		// 		publicKey: handlers.getPublicKey(name),
		// 		publicKeyBase58: handlers.getPublicKeyBase58(name)
		// 	});
		// }
		get(keypairs).forEach((value, key, map) => {
			if (value.crv == 'Ed25519') {
				const copy = { ...value };
				delete copy.d; // delete secret key portion
				results.push(copy);
			}
			if (value.kty == 'RSA') {
				const jwk = { ...value };
				delete jwk.d; // RSA secret exponent d
				delete jwk.p; // RSA secret prime p
				delete jwk.q; // RSA secret prime q with p < q
				delete jwk.dp;
				delete jwk.dq;
				delete jwk.qi;
				results.push(jwk);
			}
		});
		return results;
	},

	// returns a list of JWK publicKeys for the wallet
	getKeys: () => {
		return keys;
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
		if (
			window.confirm(
				`Authorize site to decrypt ${textDecoder.decode(new Uint8Array(encryptedMessage.tag))}?`
			)
		) {
			let decrypted_message = pre.get(pre_name).self_decrypt(encryptedMessage); // data, tag
			return decrypted_message;
		}
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
	},
	arweaveWalletAPI
};
