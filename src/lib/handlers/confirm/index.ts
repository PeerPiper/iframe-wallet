import { handlers } from '../';
import DefaultConfirmation from './DefaultConfirmation.svelte';
import Connect from './Connect.svelte';

let confirmationComponents = {
	// Splash: { component: Splash },
};

// setup boring defaults, can be overriden with fanicer by users
for (const [key, value] of Object.entries(handlers)) {
	confirmationComponents[key] = { component: DefaultConfirmation };
}

// Customize certain confirmation components
let customizedComponents = { connect: { component: Connect } };

confirmationComponents = { ...confirmationComponents, ...customizedComponents };

export { confirmationComponents };
