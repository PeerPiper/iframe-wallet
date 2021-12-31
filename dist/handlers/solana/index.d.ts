export declare const solana: {
    signTransaction: (transaction: any) => Promise<void>;
    signAllTransactions: (txs: Transaction[]) => Promise<void>;
    publicKey: () => Promise<void>;
    createSignature: (message: any) => any;
};
