// deploy to ArLog
/**

PUBLISH STEP:
- make the Arweave/ArLog contract: arlog.createNewLog('use_wallet');
- embed contract ID into app --- arlog.read(contractid)

IPFS:
- publish app to IPFS

VIEW:
- go to IPFS link
- Smartweave in the App pulls up latest contract state
- loads latest state as the App component

To update app:
- Publish to IPFS again 
- save IPFS CID as new input 
- use an existing contract to update: await $arlog.write(keyfile, contractID, input);
 */
import ArLog from '../arlog/dist/arlog';
import config from '../arlog/dist/config';

import fs from 'fs';
import spawn from 'cross-spawn';

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SLASH = path.sep;

const CONTRACT_TX_ID = 'EMFj1jzmJ3N5tRDWRy18mG-9cub4_XcrSHZDAzUl1MY'; // fll in once your first publish is done. TODO: Save to/read from .json file instead

const name = 'iframe-wallet';

// const arweaveKeyfileName = `../arweave-keyfile.json` // live
const arweaveKeyfileName = `../test-keyfile.json`; // test
const arweaveKeyfile = path.resolve(`${__dirname}${SLASH}${arweaveKeyfileName}`);

const arlogConfigJsonName = `arlog.config.json`;
const arlogConfigJson = path.resolve(`${__dirname}${SLASH}${arlogConfigJsonName}`);

function readKeyfile(keypairfile) {
	let kf = fs.readFileSync(keypairfile);
	return JSON.parse(kf.toString());
}

const source = `export function handle(state, action) {
	if (action.caller !== state.owner) {
		return { state }; // readonly unless you'r the owner
	}
	if (action.input.function === 'Update') {
		state.latest = action.input.latest;
	}

	return { state };
}
`;

const init = async () => {
	const payerWallet = readKeyfile(arweaveKeyfile);

	const arlog = new ArLog({ arweave: config.networks.LOCAL_TEST_NET });
	const addr = await arlog.arweave.wallets.getAddress(payerWallet);
	console.log({ addr });
	const bal = await config.networks['LOCAL_TEST_NET'].drop(arlog, addr);
	console.log('Airdroped \n ', bal);

	const opts = { name, ipfs: 'TBD', arweave: 'TBD', source };
	const txID = await arlog.createNewLog(payerWallet, opts);
    await config.networks['LOCAL_TEST_NET'].mine(arlog);

	// add txID to build
	console.log('Created contract \n ', txID);

	fs.writeFileSync(arlogConfigJson, JSON.stringify({ contractID: txID }));
};

init();
