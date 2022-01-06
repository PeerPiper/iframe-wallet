import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import { globbySync } from 'globby';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import { wasm } from '@rollup/plugin-wasm';
import svg from 'rollup-plugin-svg';
import json from '@rollup/plugin-json';
import inlineSvg from 'rollup-plugin-inline-svg';

const production = !process.env.ROLLUP_WATCH;
const formats = ['iife', 'umd', 'es']; //
const components = ['Portal']; // globbySync('src/lib/**/*.svelte').map((path) => path.split('/')[2]);

export default components.map((component) => ({
	input: `src/lib/${component}.svelte`,
	output: formats.map((format) => ({
		name: component,
		file: `src/lib/bundled/${format}/${component}.min.js`, // gets added to deployments & package manager this way
		// dir: `build/components/`,
		format,
		inlineDynamicImports: true
		// sourcemap: true
	})),
	plugins: [
		json(),
		inlineSvg({}),
		typescript({
			sourceMap: !production
		}),
		wasm(),
		svg(),
		svelte({
			compilerOptions: {
				dev: !production
				// customElement: true
			},
			preprocess: sveltePreprocess({
				sourceMap: !production
			}),
			emitCss: false // inline
		}),
		css({ output: 'bundle.css' }), // not needed if emitCss: false
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs()
		// terser()
	],
	watch: {
		clearScreen: false
	}
}));
