/** @typedef {typeof __propDef.props}  DefaultConfirmationProps */
/** @typedef {typeof __propDef.events}  DefaultConfirmationEvents */
/** @typedef {typeof __propDef.slots}  DefaultConfirmationSlots */
export default class DefaultConfirmation extends SvelteComponentTyped<{
    props: any;
    handleConfirm?: () => void;
}, {
    confirmed: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {
        handleConfirm: () => void;
        props: any;
    };
}> {
    get handleConfirm(): () => void;
}
export type DefaultConfirmationProps = typeof __propDef.props;
export type DefaultConfirmationEvents = typeof __propDef.events;
export type DefaultConfirmationSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        props: any;
        handleConfirm?: () => void;
    };
    events: {
        confirmed: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            handleConfirm: () => void;
            props: any;
        };
    };
};
export {};
