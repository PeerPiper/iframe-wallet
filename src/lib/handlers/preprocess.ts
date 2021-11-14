// import { handlers } from '../index';
import * as ArweaveUtils from './arweave/utils';

export const maybePreprocess = (regularRPC, rpc, method, target) => {
	if (method == 'arweaveWalletAPI.sign') {
		return async function () {
			// only pass the actual signing to the wallet
			// do everything else here

			const [transaction, options] = arguments;

			console.log('signing', { transaction });

			// transaction: Transaction
			// 	 chunks: {data_root: Uint8Array(32), chunks: Array(1), proofs: Array(1)}
			// 	 data: Uint8Array(252) [101, 120, 112, 111, 114, 116, 32, 102, 117, 110, 99, 116, 105, 111, 110, 32, 104, 97, 110, 100, 108, 101, 40, 115, 116, 97, 116, 101, 44, 32, 97, 99, 116, 105, 111, 110, 41, 32, 123, 13, 10, 9, 105, 102, 32, 40, 97, 99, 116, 105, 111, 110, 46, 99, 97, 108, 108, 101, 114, 32, 33, 61, 61, 32, 115, 116, 97, 116, 101, 46, 111, 119, 110, 101, 114, 41, 32, 123, 13, 10, 9, 9, 114, 101, 116, 117, 114, 110, 32, 123, 32, 115, 116, 97, 116, 101, 32, 125, 59, 32, …]
			// 	 data_root: "0lWzjBCMlPgMJz9uSjZ1xkDB3s7BF-DdlYk6nosttcs"
			// 	 data_size: "252"
			// 	 format: 2
			// 	 id: ""
			// 	 last_tx: "aLW75FPQE3DxC9B18sc7W89pH47xCtxbdehZoj8O3d-lpMFjY8WFZIVjTS-P25n2"
			// 	 owner: "p3741HbksCbRbwhZBPg-6CWnUMhoEKtla8dcIINQMX_eT1543BprBgTkttZG5IzlOP8EIlJEX1I1-N3BvFHYrkze961nUu1epW3IQwdPgu_bk1PCGPefG_wPaRql-inXWi90eupbzh3lM6yqDx1rejE3750I77bO5QV10DCY95X_xvzZ4v9jD3KrF_TeIrMkv4oKNNXu_bmgN1hAJOODMba7O9EicF0mkE-VYlk04LXT_6YtvPQOCQPDdqd2nBcGhpv_mR1IXaVBlVc39L3hFozayJvH5vlVdSyMr_NMEWikZgMk3WPIMrr03s59KcvpshhPIuhBgVTV1qe_BTH5C8KrOLfPAfr0Byqoa8vIuWZUlhQDWdXHlLNN-Gcv9iLJXWjULMHS91oeuMmOJjw-xLZuOizmFILq8RWXlO5v9zQRdXDUmMagBOqBdPcQjmsJltvOQ9_RFmd4s9rDo7au3WUbffw9aazIweePMr7QdVu1gdnASJtc-nRbWQ6rJWCw0EWu5usTqRY6TVeWthBRimDb7F1X6BazpbjHBE6pPK7bkkHW8jr3XASTgXh2t3uplfe5jPcMIE2vy5KAft6fMvluidP_voesTzi0HcJrFh4z2TJVFBGqG7rvr88dTMx6W_qJB_gxKCRATms7bP853TRwMSrU6m8GPTVrOJBSHIk"
			// 	 quantity: "0"
			// 	 reward: "2816683"
			// 	 signature: ""
			// 	 tags: (3) [Tag, Tag, Tag]
			// 	 target: ""

			// getAddress
			const keys = await rpc('getLoadedKeys', {});

			const rsas = keys.filter((k) => k.kty == 'RSA');

			transaction.setOwner(rsas[0].n);

			let dataToSign = await transaction.getSignatureData();

			// replace with RPC call to wallet:
			// let rawSignature = await crypto.subtle.sign(jwk, dataToSign, options);
			const rawSignature = await rpc(method, { dataToSign, options, transaction });

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
