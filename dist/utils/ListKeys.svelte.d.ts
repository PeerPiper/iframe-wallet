/** @typedef {typeof __propDef.props}  ListKeysProps */
/** @typedef {typeof __propDef.events}  ListKeysEvents */
/** @typedef {typeof __propDef.slots}  ListKeysSlots */
export default class ListKeys extends SvelteComponentTyped<{
    keys: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ListKeysProps = typeof __propDef.props;
export type ListKeysEvents = typeof __propDef.events;
export type ListKeysSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        keys: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
