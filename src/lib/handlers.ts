import * as CONSTANTS from './constants';

let config: { [Key: string]: any } = {};
let wasmWallet;

let pre = new Map();

export const handlers: { [Key: string]: Function } = {
	initialize: async () => {
		wasmWallet = await import('../../../rust-projects/transform_recryption/wasm-code/pkg');
		await wasmWallet.default(); // initialize
		return { status: CONSTANTS.INITIALIZED };
	},

	setConfig(key: string, value: any) {
		config[key] = value;
	},

	getConfig() {
		return config;
	},

	connect: () => {
		if (window.confirm(`Authorize this site to connect to your wallet?`)) {
			const ret = { status: CONSTANTS.CONNECTED, message: 'Wallet connected!' };
			return ret;
		} else {
			return { status: CONSTANTS.DISCONNECTED, message: 'Connection denied' };
		}
	},

	generate_ed25519_keypair: () => {
		let keypair = wasmWallet.generate_ed25519_keypair();
		let publicKey = keypair.public();
		let secretKey = keypair.secret();
		return { publicKey, secretKey };
	},

	newProxcryptor: (pre_name, secretKey) => {
		pre.set(pre_name, wasmWallet.Proxcryptor.new(secretKey));
		return pre_name;
	},

	selfEncrypt: (pre_name, data, tag) => {
		let encrypted_message = pre.get(pre_name).self_encrypt(data, tag); // data, tag
		return encrypted_message;
	},

	generateReKey: (pre_name, targetPublicKey, tag) => {
		let re_key = pre.get(pre_name).generate_re_key(targetPublicKey, tag);
		return re_key;
	},

	reEncrypt: (targetPublicKey, encrypted_message, re_key) => {
		console.log('Handler reEncrypt: ', { targetPublicKey, encrypted_message, re_key });
		let re_encrypted_message = wasmWallet.Proxcryptor.re_encrypt(
			targetPublicKey,
			encrypted_message,
			re_key
		);
		return re_encrypted_message;
	},

	reDecrypt: (pre_name, re_encrypted_message) => {
		let reDecryptedMsg = pre.get(pre_name).re_decrypt(re_encrypted_message);
		return reDecryptedMsg; // textDecoder.decode(reDecryptedMsg);
	}
};
