export declare const arweaveWalletAPI: {
    generateJWK: () => Promise<any>;
    connect(permissions: PermissionType[], appInfo?: {
        name?: string;
        logo?: string;
    }): Promise<boolean>;
    disconnect(): Promise<boolean>;
    getActiveAddress(): Promise<string>;
    getActivePublicKey(): Promise<void>;
    getAllAddresses(): Promise<void>;
    getWalletNames(): Promise<{
        [addr: string]: string;
    }>;
    addToken(id: string): Promise<void>;
    sign(params: any): Promise<Signature>;
    getPermissions(): Promise<PermissionType[]>;
    getArweaveConfig(): Promise<IArweave>;
    encrypt(data: string, options: {
        algorithm: string;
        hash: string;
        salt?: string;
    }): Promise<Uint8Array>;
    decrypt(data: Uint8Array, options: {
        algorithm: string;
        hash: string;
        salt?: string;
    }): Promise<string>;
    signature(data: Uint8Array, algorithm: any): Promise<string>;
    noop(): any;
};
declare global {
    interface Window {
        arweaveWallet: typeof arweaveWalletAPI;
    }
    interface WindowEventMap {
        walletSwitch: CustomEvent<{
            address: string;
        }>;
        arweaveWalletLoaded: CustomEvent<{}>;
    }
}
