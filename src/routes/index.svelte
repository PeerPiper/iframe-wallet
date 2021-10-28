<script>
	import { onMount } from 'svelte';
	import * as CONSTANTS from '$lib/constants';
	import { handlers } from '$lib/handlers';

	const DEFAULT_NAMESPACE = '_k';

	let rx;
	let reply;
	let handleMessage;
	let origin = null; // '*';
	const def = null;
	let keypair;

	let loadKeypair;
	let proxcryptor;
	let wasmWallet;

	onMount(async () => {
		const Buffer = await import('buffer');
		global.Buffer = Buffer.Buffer;

		// load browser db
		const { ImmortalDB } = await import('immortal-db');

		wasmWallet = await import('../../../rust-projects/transform_recryption/wasm-code/pkg');
		await wasmWallet.default(); // initialize

		const textDecoder = new TextDecoder();

		async function kitchenSink() {
			let keypair = wasmWallet.generate_ed25519_keypair();
			// console.log(`Keypair: `, { keypair }, keypair.public(), keypair.secret());

			let alice_pre = wasmWallet.Proxcryptor.new(keypair.secret());

			console.log({ alice_pre });

			let data = 'some real good data';
			let tag = 'some real good tag';
			let encrypted_message = alice_pre.self_encrypt(data, tag); // data, tag

			console.log({ encrypted_message });

			let bob_keypair = wasmWallet.generate_ed25519_keypair();
			let bob_pre = wasmWallet.Proxcryptor.new(bob_keypair.secret());

			let re_key = alice_pre.generate_re_key(bob_keypair.public(), tag);

			console.log({ re_key });

			let re_encrypted_message = wasmWallet.Proxcryptor.re_encrypt(
				bob_keypair.public(),
				encrypted_message,
				re_key
			); // bob, res, reKey, curve

			console.log({ re_encrypted_message });

			let data_2 = bob_pre.re_decrypt(re_encrypted_message);

			console.log({ data_2 });
			let decoded = textDecoder.decode(new Uint8Array(data_2));

			console.log({ decoded }, decoded === data);
		}

		kitchenSink();

		// loadKeypair = async (namespace) => {
		// 	const storedValue = await ImmortalDB.get(namespace || DEFAULT_NAMESPACE, def);

		// 	let parsedStore;
		// 	if (storedValue) {
		// 		parsedStore = new Uint8Array(Object.values(JSON.parse(storedValue)));
		// 	}

		// 	// setup Keypair
		// 	keypair = parsedStore
		// 		? wasmWallet.generate_ed25519_keypair_from_seed(parsedStore)
		// 		: wasmWallet.generate_ed25519_keypair();
		// 	ImmortalDB.set(namespace || DEFAULT_NAMESPACE, JSON.stringify(keypair.secretKey));
		// 	proxcryptor = new Proxcryptor(keypair);
		// 	return keypair.publicKey.toString();
		// };

		/**
		 * Handle incoming messages to the iFrame
		 */
		handleMessage = async (event) => {
			if (!event.ports[0]) return; // skip if not a port-port message

			reply = (r) => {
				// @ts-ignore
				event.ports[0].postMessage(r);
			};

			let method = event.data?.method;
			let params = event.data?.params;

			if (!(method in handlers)) {
				reply({ status: CONSTANTS.ERROR_METHOD_NOT_FOUND });
				return;
			}

			/**
			 * Passed all criteria, call the RPC function
			 */
			try {
				let fn = handlers[method];
				let args = params ? params : [];
				console.log({ args });
				const result = await fn(...args);
				console.log({ result });
				reply(result);
			} catch (error) {
				console.error(`RPC error calling ${method}(${params.toString()})`);
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
