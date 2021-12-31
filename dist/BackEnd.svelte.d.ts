/** @typedef {typeof __propDef.props}  BackEndProps */
/** @typedef {typeof __propDef.events}  BackEndEvents */
/** @typedef {typeof __propDef.slots}  BackEndSlots */
export default class BackEnd extends SvelteComponentTyped<{
    handlers: any;
    importKeys: any;
    getStoredKeys: any;
    storedValue: any;
    KEYS_SYNC: any;
    OPENED_SIGNAL: any;
    stayConnected: boolean;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type BackEndProps = typeof __propDef.props;
export type BackEndEvents = typeof __propDef.events;
export type BackEndSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        handlers: any;
        importKeys: any;
        getStoredKeys: any;
        storedValue: any;
        KEYS_SYNC: any;
        OPENED_SIGNAL: any;
        stayConnected: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
