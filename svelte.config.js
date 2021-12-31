import preprocess from 'svelte-preprocess';
import vercelAdapter from '@sveltejs/adapter-vercel';
import staticIPFSAdapter from 'sveltejs-adapter-ipfs';
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
	preprocess: preprocess(),

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
				return mm.isMatch(filepath, ['!**/_*', '!**/internal/**', '!./wasm/**', '!./graphics/**']);
			},
			files: mm.matcher('!**/build.*')
		},
		adapter: staticIPFSAdapter({
			removeBuiltInServiceWorkerRegistration: true,
			injectPagesInServiceWorker: true
		})
		// adapter: vercelAdapter()
	}
};

export default config;
