// deploy to ArLog
/**

APPS to ARWEAVE
DATA to IPLD, with optional follow-on to Arweave at user's discretion

PUBLISH STEP:
1. Save this version to Arweave, get Arweave Tx ID
2. Save this version Tx ID to the Arlog namespace: arlog.list(ownerAddress) arlog.name == 'this_project_name'
3. If namespace doesn't exist, make the Arweave/ArLog contract: arlog.createNewLog('use_wallet');

No need to remember the contract ID, as this is associated with the name of the ArLog :)

use an existing contract to update: await $arlog.write(keyfile, contractID, input);
 */
import ArLog from '../arlog/dist/arlog';
import config from '../arlog/dist/config';

import fs from 'fs';
import spawn from 'cross-spawn';

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import CliCommands from '../arkb/bin/commands';
import { setArweaveInstance } from '../arkb/bin/utils/utils';
import Conf from 'conf';

const conf = new Conf();
const cliCommands = new CliCommands.default();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SLASH = path.sep;

const name = 'iframe-wallet';

const CHOSEN_NET = 'AR_LOCAL';
const arweaveKeyfileName = {
	LOCAL_TEST_NET: `../test-keyfile.json`,
	AR_LOCAL: `../test-keyfile.json`,
	DEV_NET: `../test-keyfile.json`,
	MAIN_NET: `../arweave-keyfile.json`
};

const arweaveKeyfileRel = arweaveKeyfileName[CHOSEN_NET];
const arweaveKeyfile = path.resolve(`${__dirname}${SLASH}${arweaveKeyfileRel}`);

const arlogConfigJsonName = `arlog.config.json`;
const arlogConfigJson = path.resolve(`${__dirname}${SLASH}${arlogConfigJsonName}`);


function readJsonfile(keypairfile) {
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

(async () => {
	const payerWallet = readJsonfile(arweaveKeyfile);

	const arlog = new ArLog({ arweave: config.networks[CHOSEN_NET] });
	const addr = await arlog.arweave.wallets.getAddress(payerWallet);
	console.log({ addr });
	const bal = await config.networks[CHOSEN_NET].mint(arlog, addr);
	await config.networks[CHOSEN_NET].mine(arlog);
	await config.networks[CHOSEN_NET].mine(arlog);

	console.log('\nAirdroped mint ', bal);

	// Save this app to Arweave, get a Tx ID
	const args = [
		'--ipfs-publish',
		'--auto-confirm',
		'--gateway',
		`${config.networks[CHOSEN_NET].protocol}://${config.networks[CHOSEN_NET].host}:${config.networks[CHOSEN_NET].port}`,
		'deploy',
		`./build`,
		'--wallet',
		arweaveKeyfileRel
	];

	// console.log({ args });
	// console.log('Spawning...');

	var savedOutput = [];

	// let result = spawn.sync('arkb', args, {
	// 	cwd: process.cwd(),
	// 	env: process.env,
	// 	stdio: 'pipe',
	// 	encoding: 'utf-8'
	// });

	process.on('uncaughtException', function (err) {
		console.log({ err });
	});

	// minimist style
	const argv = {
		_: ['deploy', './build'],
		'ipfs-publish': true,
		'auto-confirm': true,
		gateway: `${config.networks[CHOSEN_NET].protocol}://${config.networks[CHOSEN_NET].host}:${config.networks[CHOSEN_NET].port}`,
		wallet: arweaveKeyfileRel
	};
	const debug = false;
	const blockweave = setArweaveInstance(argv, debug);
	const manifestTx = await cliCommands.cliTask({
		argv,
		config: conf,
		debug,
		blockweave
	});

	console.log({ manifestTx });

	await config.networks[CHOSEN_NET].mine(arlog);
	await config.networks[CHOSEN_NET].mine(arlog);

	// result.on('data', function (data) {
	// 	console.log('stdout: ' + data);

	// 	data = data.toString();
	// 	savedOutput.push(data);
	// });

	// result.on('close', function (data) {
	// 	console.log('Spawn closed ');
	// 	console.log(String(savedOutput));
	// 	fs.writeFileSync(`./logs/${+new Date()}.json`, savedOutput);
	// });

	// console.log('Spawn Complete.');

	// var savedOutput = result.stdout; // get the resulting TX ID

	// console.log(String(savedOutput));

	// fs.writeFileSync(`./logs/${+new Date()}.txt`, savedOutput);

	async function createLog() {
		console.log('Creating ArLog \n ', txID);
		const opts = { name, ipfs: 'TBD', arweave: 'TBD', source };
		const txID = await arlog.createNewLog(payerWallet, opts);
		// await config.networks[CHOSEN_NET].mine(arlog);

		// add txID to build
		console.log('Created contract \n ', txID);

		fs.writeFileSync(arlogConfigJson, JSON.stringify({ contractID: txID }));
	}

	async function updateLog() {
		const configJson = readJsonfile(arlogConfigJson);
		const contractID = configJson.contractID;
		const latestIPFSCID = configJson.latestIPFSCID; // TODO: Save this app to IPFS

		let latest = {};
		latest['ipfs'] = latestIPFSCID;
		latest['arweave'] = 'TBD'; // TODO: Save the ipfs2arweave first
		let input = {
			function: 'Update',
			latest
		};

		const txid = await arlog.write(payerWallet, contractID, input);

		console.log('ArLog updated \n ', txID);
		console.log({ txid });
	}

	/**
		TODO: move this to arlog library
		TODO: Find all SmartWeaves for this own (ardb)
		read through contracts
		filter based on name
		if no name exists, make a new one with the name
		if name exists, update it.
	*/
	if (!fs.existsSync(arlogConfigJson)) {
		// createLog();
	} else {
		// Save this app to IPFS
		// updateLog();
	}
})();
