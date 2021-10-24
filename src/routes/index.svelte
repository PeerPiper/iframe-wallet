<script>
	import { onMount } from 'svelte';
	import * as CONSTANTS from '$lib/constants';
	import * as nacl from 'tweetnacl';

	const DEFAULT_NAMESPACE = '_k';

	let rx;
	let reply;
	let handleMessage;
	let origin = null; // '*';
	const def = null;
	let keypair;

	let loadKeypair;
	let proxcryptor;

	onMount(async () => {
		const textDecoder = new TextDecoder();

		const mod = await import('../../../rust-projects/transform_recryption/wasm-code/pkg');

		console.log({ initWasm: mod });

		// @ts-ignore
		const wasmWallet = await mod.default();
		console.log({ wasmWallet });

		let ctr = mod.Counter.new('c', 0);
		console.log({ ctr });
		console.log(ctr.count());
		console.log(ctr.increment());
		console.log(ctr.count());

		keypair = nacl.sign.keyPair();
		let alice_pre = mod.Proxcryptor.new(keypair.secretKey);

		console.log({ alice_pre });

		let data = 'some data';
		let tag = 'some tag';
		let encrypted_message = alice_pre.self_encrypt(data, tag); // data, tag

		console.log({ encrypted_message });

		let bob_keypair = nacl.sign.keyPair();
		let bob_pre = mod.Proxcryptor.new(bob_keypair.secretKey);

		let re_key = alice_pre.generate_re_key(bob_keypair.publicKey, tag);

		console.log({ re_key });

		let re_encrypted_message = mod.Proxcryptor.re_encrypt(
			bob_keypair.publicKey,
			encrypted_message,
			re_key
		); // bob, res, reKey, curve

		console.log({ re_encrypted_message });

		let data_2 = bob_pre.re_decrypt(re_encrypted_message);

		console.log({ data_2 });
		let decoded = textDecoder.decode(new Uint8Array(data_2));

		console.log({ decoded }, decoded === data);

		const Buffer = await import('buffer');
		global.Buffer = Buffer.Buffer;

		const { Proxcryptor } = await import('$lib/proxcryptor');

		// load browser db
		const { ImmortalDB } = await import('immortal-db');

		loadKeypair = async (namespace) => {
			const storedValue = await ImmortalDB.get(namespace || DEFAULT_NAMESPACE, def);

			let parsedStore;
			if (storedValue) {
				parsedStore = new Uint8Array(Object.values(JSON.parse(storedValue)));
			}

			// setup Keypair
			keypair = parsedStore ? nacl.sign.keyPair.fromSecretKey(parsedStore) : nacl.sign.keyPair();
			ImmortalDB.set(namespace || DEFAULT_NAMESPACE, JSON.stringify(keypair.secretKey));
			proxcryptor = new Proxcryptor(keypair);
			return keypair.publicKey.toString();
		};

		handleMessage = async (event) => {
			/**
			 * Connect sets the postMessage origin to the connector origin
			 */
			reply = (r) => {
				// @ts-ignore
				event.ports[0].postMessage(r);
			};

			if (!event.data.action) return;
			switch (event.data?.action) {
				case CONSTANTS.CONNECT:
					if (window.confirm(`Authorize ${event.origin} to connect to your wallet?`)) {
						origin = event.origin; // do I even need this with msg channels?
						rx = 'Connected to ' + event.origin;
						reply({ status: CONSTANTS.CONNECTED, message: 'Channel connected, dude!' });
					}
					break;
				case CONSTANTS.DISCONNECT:
					reply({ status: CONSTANTS.DISCONNECTED, message: 'Disconnected, man!' });
					origin = null;
					rx = 'Disonnected from origin ';
					break;
				case CONSTANTS.INITIALIZE:
					// event.data?.args?.namespace
					const res = await loadKeypair();
					console.log({ res });
					reply({ status: CONSTANTS.INITIALIZED, message: `Connected to Public Key: ${res}` });
					break;
				default:
					console.log('default case');
					break;
			}
		};
	});
</script>

<svelte:head>
	<script>
		global = globalThis; // for solana web3 repo
	</script>
</svelte:head>
<svelte:window on:message={handleMessage} />

<h1>Welcome to iFrame Wallet!</h1>
<p>
	The idea is this wallet is embedded in an iframe in the host's SubmitEvent, so the contexts are
	different and your keys are safe.
</p>
{rx}
