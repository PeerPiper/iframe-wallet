import { browser } from '$app/env';

// inspired by https://github.com/doomnoodles/sveltekit-rust-ssr-template/blob/sveltekit-rust-ssr-template-buggy-branch/src/routes/index.svelte
export async function initModule(viteInitModuleFunction, initFunction) {
	let functionString = viteInitModuleFunction.toString();
	const quoteIndex = functionString.indexOf('"');
	const relUrl = quoteIndex !== -1 ? functionString.slice(quoteIndex + 1, -2) : functionString;
	// this line is crucial for ssr, because node doesn't understand relative urls
	const url = browser ? relUrl : `http://${host}` + relUrl; // TODO: find a way to derive the localhost part dynamically
	return await initFunction(url);
}
