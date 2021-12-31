import { initModule } from '../utils';
let solanaAPI;
const initialize = async () => {
    if (!host)
        return new Error('Host not set. Run setHost($page.host) first.');
    solanaAPI = await import('./solanaSDK/solana_wasm_sdk');
    await initModule(mod, solanaAPI.default);
    // return { status: CONSTANTS.INITIALIZED };
};
initialize();
export const solana = {
    // effectively:
    // https://github.com/solana-labs/solana-web3.js/blob/b45f06503e7fef60b081938d2187c7e97c98125a/src/transaction.ts#L508
    signTransaction: async (transaction) => {
        // init test
        solanaAPI.greet();
        // const message = transaction._compile(); // https://github.com/solana-labs/solana-web3.js/blob/b45f06503e7fef60b081938d2187c7e97c98125a/src/transaction.ts#L501
        // transaction.partialSign(this.account); // Array<Signer>
        // return transaction;
    },
    signAllTransactions: async (txs) => { },
    publicKey: async () => { },
    createSignature = (message) => {
        return bs58.encode(nacl.sign.detached(message, this.account.secretKey));
    }
};
