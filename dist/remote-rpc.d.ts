export declare function config(config: any): void;
declare class RemoteRpcProxy {
    [x: string]: any;
    constructor(target?: {
        [Key: string]: Function;
    }, validatorArg?: boolean);
}
export declare const remote: RemoteRpcProxy;
export {};
