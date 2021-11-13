// import { handlers } from '../index';
import * as ArweaveUtils from './arweave/utils';

export const maybePreprocess = (regularRPC, rpc, method, target) => {
	if (method == 'arweaveWalletAPI.sign') {
		return async function () {
			// only pass the actual signing to the wallet
			// do everything else here
			console.log('signing', { target }, { arguments }); // { transaction },

			const [transaction, options] = arguments;

			// getAddress
			const keys = await rpc('getLoadedKeys', {});

			const rsas = keys.filter((k) => k.kty == 'RSA');

			transaction.setOwner(rsas[0].n);

			let dataToSign = await transaction.getSignatureData();

			// replace with RPC call to wallet:
			// let rawSignature = await crypto.subtle.sign(jwk, dataToSign, options);
			const rawSignature = await rpc(method, { dataToSign, options });

			let id = await crypto.subtle.digest('SHA-256', rawSignature);

			transaction.setSignature({
				id: ArweaveUtils.bufferTob64Url(id),
				owner: rsas[0].n,
				signature: ArweaveUtils.bufferTob64Url(rawSignature)
			});
			return transaction;
		};
	} else return regularRPC;
};
