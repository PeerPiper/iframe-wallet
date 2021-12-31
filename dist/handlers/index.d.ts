export declare const setHost: (h: any) => void;
export declare let handlers: {
    [Key: string]: Function;
};
declare global {
    interface Window {
        portal: typeof handlers;
    }
}
