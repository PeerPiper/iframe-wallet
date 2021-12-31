/** @typedef {typeof __propDef.props}  DraggerProps */
/** @typedef {typeof __propDef.events}  DraggerEvents */
/** @typedef {typeof __propDef.slots}  DraggerSlots */
export default class Dragger extends SvelteComponentTyped<{}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type DraggerProps = typeof __propDef.props;
export type DraggerEvents = typeof __propDef.events;
export type DraggerSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {};
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
