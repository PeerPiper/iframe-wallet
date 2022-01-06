import preprocess from 'svelte-preprocess';
import vercelAdapter from '@sveltejs/adapter-vercel';
import staticIPFSAdapter from 'sveltejs-adapter-ipfs';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		preserve: ['module', 'modules']
	}),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		// adapter: staticIPFSAdapter()
		adapter: vercelAdapter()
	}
};

export default config;
