export declare const solana: {
    signTransaction: (transaction: Transaction) => Promise<void>;
    signAllTransactions: (txs: Transaction[]) => Promise<void>;
    publicKey: () => Promise<void>;
    createSignature: (message: any) => any;
};
