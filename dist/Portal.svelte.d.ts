import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        portal: any;
        origin: any;
    };
    events: {
        connected: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export declare type PortalProps = typeof __propDef.props;
export declare type PortalEvents = typeof __propDef.events;
export declare type PortalSlots = typeof __propDef.slots;
export default class Portal extends SvelteComponentTyped<PortalProps, PortalEvents, PortalSlots> {
}
export {};
