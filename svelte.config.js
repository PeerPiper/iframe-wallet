import preprocess from 'svelte-preprocess';
import vercelAdapter from '@sveltejs/adapter-vercel';
import staticIPFSAdapter from 'sveltejs-adapter-ipfs';
import adapter_static from '@sveltejs/adapter-static';

import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mm from 'micromatch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		preserve: ['module'] // https://github.com/sveltejs/svelte-preprocess/issues/261
	}),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		vite: () => ({
			// build: {
			// 	lib: {
			// 		entry: path.resolve(__dirname, 'src/lib/index.js'),
			// 		name: 'iframe-wallet',
			// 		formats: ['es']
			// 		// fileName: (format) => `iframe-wallet.${format}.js`
			// 	}
			// },
			server: {
				fs: {
					// Allow serving files from levels up to the project root
					allow: ['../../../']
				}
			}
		}),
		package: {
			dir: 'dist',
			exports: (filepath) => {
				if (filepath.endsWith('.d.ts')) return false;
				if (filepath == 'index.js') return true;
				return mm.isMatch(filepath, ['App.svelte', 'Portal.svelte']);
			},
			files: mm.matcher('!**/build.*')
		},
		adapter: staticIPFSAdapter({
			removeBuiltInServiceWorkerRegistration: true,
			injectPagesInServiceWorker: true
		})
		// adapter: adapter_static()
		// adapter: vercelAdapter()
	}
};

export default config;
