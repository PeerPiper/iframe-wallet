/** @typedef {typeof __propDef.props}  ControllerProps */
/** @typedef {typeof __propDef.events}  ControllerEvents */
/** @typedef {typeof __propDef.slots}  ControllerSlots */
export default class Controller extends SvelteComponentTyped<{
    connected: any;
    origin?: string;
    display?: boolean;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type ControllerProps = typeof __propDef.props;
export type ControllerEvents = typeof __propDef.events;
export type ControllerSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        connected: any;
        origin?: string;
        display?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
