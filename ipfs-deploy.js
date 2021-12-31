import clui from 'clui';
import { create, globSource } from 'ipfs-http-client';
import clc from 'cli-color';
import all from 'it-all';
export default class IPFS {
	constructor(logs = true) {
		this.logs = true;
	}

	async deploy(dir) {
		let countdown;
		if (this.logs) {
			countdown = new clui.Spinner(`Deploying to IPFS...`, [
				'⣾',
				'⣽',
				'⣻',
				'⢿',
				'⡿',
				'⣟',
				'⣯',
				'⣷'
			]);
			countdown.start();
		}

		const ipfs = create({
			host: 'ipfs.infura.io',
			port: 5001,
			protocol: 'https'
		});

		// @ts-ignore
		// const files = await all(
		// 	ipfs.addAll(globSource(dir, '**/*', { recursive: true, wrapWithDirectory: true })) // , wrapWithDirectory: true
		// );
		const files = await ipfs.add(globSource(dir, { recursive: true })); // , wrapWithDirectory: true

		countdown.stop();

		return files;
	}
}

export const deploy = async () => {
	const dir = './build/';

	const ipfs = new IPFS();
	const ipfsHash = await ipfs.deploy(dir);
	console.log({ ipfsHash });

	console.log('');
	console.log(clc.green('IPFS deployed! Base32 CID link: '));
	console.log(clc.cyan(`https://${ipfsHash.cid.toV1().toString()}.ipfs.dweb.link/`));
};

deploy();
