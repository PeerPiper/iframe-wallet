import { arlogDeploy } from '../arlog/dist/arlogDeploy';

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SLASH = path.sep;

const name = 'iframe-wallet';

const CHOSEN_NET = 'DEV_NET'; // AR_LOCAL

const arweaveKeyfileName = {
	LOCAL_TEST_NET: `../test-keyfile.json`,
	AR_LOCAL: `../test-keyfile.json`,
	DEV_NET: `../test-keyfile.json`,
	MAIN_NET: `../arweave-keyfile.json`
};

const arweaveKeyfilePath = arweaveKeyfileName[CHOSEN_NET];
const arweaveKeyfile = path.resolve(__dirname, arweaveKeyfilePath);

// arkb does path.join from cwd of arkb/arlog
const buildPath = `../${name}/build/`;
const deployDir = path.resolve(__dirname, buildPath);

(async () => {
	await arlogDeploy({
		name,
		arweaveKeyfile,
		deployDir: buildPath,
		CHOSEN_NET
	});
})();
