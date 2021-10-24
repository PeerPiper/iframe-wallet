import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: () => ({
			server: {
				fs: {
					// Allow serving files from one level up to the project root
					allow: ['../../../']
				}
			}
		})
	}
};

export default config;
