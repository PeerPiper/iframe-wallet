// https://github.com/lencx/vite-plugin-rsw/issues/23#issuecomment-934974157

import { readFileSync, writeFileSync } from 'fs';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SLASH = path.sep;

const p = './src/lib/wasm/wallet/wasm_code.js';

const fileName = path.resolve(`${__dirname}${SLASH}${p}`);

const re = /[^\n]*new URL[^\n]*/g;

try {
	writeFileSync(fileName, readFileSync(fileName, 'utf8').replace(re, ''));
} catch {}
