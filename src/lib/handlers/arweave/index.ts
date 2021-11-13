// import { JWKInterface, JWKPublicInterface } from 'arweave/wallet';
import * as ArweaveUtils from './utils';
import { confirm, keypairs } from '../../stores';
import { get } from 'svelte/store';

let storedPermissions;

const jwkToCryptoKey = async (jwk: JWKInterface): Promise<CryptoKey> => {
	return crypto.subtle.importKey(
		'jwk',
		jwk,
		{
			name: 'RSA-PSS',
			hash: {
				name: 'SHA-256'
			}
		},
		false,
		['sign']
	);
};

const subtleSign = async (
	jwk: JWKInterface,
	data: Uint8Array,
	{ saltLength }: SignatureOptions = {}
): Promise<Uint8Array> => {
	let signature = await crypto.subtle.sign(
		{
			name: 'RSA-PSS',
			saltLength: 32
		},
		await jwkToCryptoKey(jwk),
		data
	);

	return new Uint8Array(signature);
};
const generateJWK = async (): Promise<JWKInterface> => {
	let cryptoKey = await crypto.subtle.generateKey(
		{
			name: 'RSA-PSS',
			modulusLength: 4096,
			publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
			hash: {
				name: 'SHA-256'
			}
		},
		true,
		['sign']
	);

	let jwk = await crypto.subtle.exportKey('jwk', cryptoKey.privateKey!);

	const kid = await ownerToAddress(jwk.n);

	// RSA key parameters
	// https://www.gnupg.org/documentation/manuals/gcrypt-devel/RSA-key-parameters.html
	return {
		kty: jwk.kty!,
		e: jwk.e!, // RSA public exponent e
		n: jwk.n!, // RSA public modulus n
		d: jwk.d, // RSA secret exponent d
		p: jwk.p, // RSA secret prime p
		q: jwk.q, // RSA secret prime q with p < q
		dp: jwk.dp,
		dq: jwk.dq,
		qi: jwk.qi,
		kid
	};
};

async function publicKeytoJWK(publicModulus: string) {
	const publicKeyJWK = {
		kty: 'RSA',
		e: 'AQAB',
		n: publicModulus
	};
	// await ownerToAddress(publicKeyJWK.n);
	return publicKey;
}

async function ownerToAddress(owner: string): Promise<string> {
	return ArweaveUtils.bufferTob64Url(
		await crypto.subtle.digest('SHA-256', ArweaveUtils.b64UrlToBuffer(owner))
	);
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
	async connect(permissions: PermissionType[], appInfo: { name?: string; logo?: string } = {}) {
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
			return addr as string;
		} catch (e) {
			throw new Error(e);
		}
	},
	async getActivePublicKey() {
		try {
			const data = await callAPI({
				type: 'get_active_public_key',
				ext: 'arconnect',
				sender: 'api'
			});
			if (!data.res) throw new Error(data.message);

			return data.publicKey as string;
		} catch (e) {
			throw new Error(e);
		}
	},
	async getAllAddresses() {
		try {
			const data = await callAPI({
				type: 'get_all_addresses',
				ext: 'arconnect',
				sender: 'api'
			});
			if (!data.res) throw new Error(data.message);

			return data.addresses as string[];
		} catch (e) {
			throw new Error(e);
		}
	},
	async getWalletNames(): Promise<{ [addr: string]: string }> {
		try {
			const data = await callAPI({
				type: 'get_wallet_names',
				ext: 'arconnect',
				sender: 'api'
			});
			if (!data.res) throw new Error(data.message);

			return data.names;
		} catch (e) {
			throw new Error(e);
		}
	},
	async addToken(id: string): Promise<void> {
		try {
			const data = await callAPI({
				type: 'add_token',
				ext: 'arconnect',
				sender: 'api',
				id
			});
			if (!data.res) throw new Error(data.message);
		} catch (e) {
			throw new Error(e);
		}
	},
	async sign(params): Promise<Signature> {
		console.log(`sign with params`, { params });
		// TODO: confirm
		const address = await arweaveWalletAPI.getActiveAddress();
		// get keys
		let jwk;
		const kp = get(keypairs); // svelte stores

		console.log({ kp });

		// find the RSA key
		// kp.forEach(async (value, key, map) => {
		// 	if (value.kty == 'RSA' && addr == address) {
		// 		const addr = await ownerToAddress(value.n);
		// 		console.log({ addr });
		// 		console.log('match');
		// 		jwk = value;
		// 	}
		// });
		// for (let [k, value] of kp.entries()) {
		// 	if (k.kty == 'RSA') {
		// 		const addr = await ownerToAddress(k.n);
		// 		console.log({ addr });
		// 		if (addr == address) {
		// 			console.log('match');
		// 			jwk = value;
		// 		}
		// 	}
		// }
		await Promise.all(
			[...kp].map(async ([k, value]) => {
				console.log({ k }, { value });
				console.log('value?.kty', value?.kty, value?.kty === 'RSA');
				if (value?.kty === 'RSA') {
					const addr = await ownerToAddress(value.n);
					console.log({ addr });
					if (addr == address) {
						console.log('match');
						jwk = value;
					}
				}
			})
		);
		// pull out RSA matching jwk.n
		console.log('using jwk ', { jwk });
		const rawSig = await subtleSign(jwk, params.dataToSign);
		return rawSig;
		// const arweave = new Arweave({
		// 	host: 'arweave.net',
		// 	port: 443,
		// 	protocol: 'https'
		// });
		// try {
		// 	const data = await callAPI({
		// 		type: 'sign_transaction',
		// 		ext: 'arconnect',
		// 		sender: 'api',
		// 		transaction,
		// 		signatureOptions: options
		// 	});
		// 	if (!data.res || !data.transaction) throw new Error(data.message);
		// 	const decodeTransaction = arweave.transactions.fromRaw(data.transaction);
		// 	if (data.arConfetti) {
		// 		for (let i = 0; i < 8; i++) setTimeout(() => createCoinWithAnimation(), i * 150);
		// 	}
		// 	return decodeTransaction;
		// } catch (e) {
		// 	throw new Error(e);
		// }
	},
	async getPermissions(): Promise<PermissionType[]> {
		const permissions: PermissionType[] = storedPermissions;
		return permissions;
	},
	async getArweaveConfig(): Promise<IArweave> {
		try {
			const data = await callAPI({
				type: 'get_arweave_config',
				ext: 'arconnect',
				sender: 'api'
			});
			if (!data.config) throw new Error(data.message);
			return data.config;
		} catch (e) {
			throw new Error(e);
		}
	},
	async encrypt(
		data: string,
		options: {
			algorithm: string;
			hash: string;
			salt?: string;
		}
	): Promise<Uint8Array> {
		try {
			const result = await callAPI({
				type: 'encrypt',
				ext: 'arconnect',
				sender: 'api',
				data,
				options
			});
			if (!result.res || !result.data) throw new Error(result.message);
			return new Uint8Array(Object.values(result.data));
		} catch (e) {
			throw new Error(e);
		}
	},
	async decrypt(
		data: Uint8Array,
		options: {
			algorithm: string;
			hash: string;
			salt?: string;
		}
	): Promise<string> {
		try {
			const result = await callAPI({
				type: 'decrypt',
				ext: 'arconnect',
				sender: 'api',
				data,
				options
			});
			if (!result.res || !result.data) throw new Error(result.message);
			return result.data;
		} catch (e) {
			throw new Error(e);
		}
	},
	async signature(data: Uint8Array, algorithm: any): Promise<string> {
		try {
			const result = await callAPI({
				type: 'signature',
				ext: 'arconnect',
				sender: 'api',
				data,
				options: algorithm
			});
			if (!result.res || !result.data) throw new Error(result.message);
			return result.data;
		} catch (e) {
			throw new Error(e);
		}
	}
};

declare global {
	interface Window {
		arweaveWallet: typeof arweaveWalletAPI;
	}
	interface WindowEventMap {
		walletSwitch: CustomEvent<{ address: string }>;
		arweaveWalletLoaded: CustomEvent<{}>;
	}
}
