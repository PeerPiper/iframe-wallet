/** @typedef {typeof __propDef.props}  ConnectProps */
/** @typedef {typeof __propDef.events}  ConnectEvents */
/** @typedef {typeof __propDef.slots}  ConnectSlots */
export default class Connect extends SvelteComponentTyped<{
    props: any;
}, {
    confirmed: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ConnectProps = typeof __propDef.props;
export type ConnectEvents = typeof __propDef.events;
export type ConnectSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        props: any;
    };
    events: {
        confirmed: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
