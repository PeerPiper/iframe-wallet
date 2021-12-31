/** @typedef {typeof __propDef.props}  ConfirmSignProps */
/** @typedef {typeof __propDef.events}  ConfirmSignEvents */
/** @typedef {typeof __propDef.slots}  ConfirmSignSlots */
export default class ConfirmSign extends SvelteComponentTyped<{
    props: any;
}, {
    confirmed: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ConfirmSignProps = typeof __propDef.props;
export type ConfirmSignEvents = typeof __propDef.events;
export type ConfirmSignSlots = typeof __propDef.slots;
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
