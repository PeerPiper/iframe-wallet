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

const production = !process.env.ROLLUP_WATCH;
const formats = ['iife', 'umd', 'es']; //
const components = ['Portal']; // globbySync('src/lib/**/*.svelte').map((path) => path.split('/')[2]);

export default components.map((component) => ({
	input: `src/lib/${component}.svelte`,
	output: formats.map((format) => ({
		name: component,
		file: `build/components/${format}/${component}.min.js`,
		// dir: `build/components/`,
		format,
		inlineDynamicImports: true
	})),
	plugins: [
		typescript({ sourceMap: !production }),
		wasm(),
		svg(),
		svelte({
			compilerOptions: { dev: !production, customElement: true },
			preprocess: sveltePreprocess({
				sourceMap: true
			})
		}),
		css({ output: 'bundle.css' }),
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		terser()
	],
	watch: {
		clearScreen: false
	}
}));
