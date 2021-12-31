/** @typedef {typeof __propDef.props}  FrontEndProps */
/** @typedef {typeof __propDef.events}  FrontEndEvents */
/** @typedef {typeof __propDef.slots}  FrontEndSlots */
export default class FrontEnd extends SvelteComponentTyped<{
    storedValue: any;
    connected: any;
    topUrl: any;
    stayConnected: any;
    handleDisconnect: any;
    importKeys: any;
    OPENED_SIGNAL: any;
    KEYS_SYNC: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type FrontEndProps = typeof __propDef.props;
export type FrontEndEvents = typeof __propDef.events;
export type FrontEndSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        storedValue: any;
        connected: any;
        topUrl: any;
        stayConnected: any;
        handleDisconnect: any;
        importKeys: any;
        OPENED_SIGNAL: any;
        KEYS_SYNC: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
