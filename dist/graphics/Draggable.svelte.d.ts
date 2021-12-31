/** @typedef {typeof __propDef.props}  DraggableProps */
/** @typedef {typeof __propDef.events}  DraggableEvents */
/** @typedef {typeof __propDef.slots}  DraggableSlots */
export default class Draggable extends SvelteComponentTyped<{
    x: number;
    y: number;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type DraggableProps = typeof __propDef.props;
export type DraggableEvents = typeof __propDef.events;
export type DraggableSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        x: number;
        y: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
