<script>
	import '../app.css';

	import { onMount } from 'svelte';
	import * as CONSTANTS from '$lib/constants';
	import { handlers, setHost } from '$lib/handlers';
	import { page } from '$app/stores';

	setHost($page.host);

	let result;
	let keys;
	let handleMessage;
	let handleGenerateKeypair;
	let handleConnect;
	let connected;
	let parsedStore;
	let isTopWindow;

	const SAVED_KEY = '__SAVED_KEY';
	const def = null;

	onMount(async () => {
		// TODO: Split RPC into local only and remote access?
		isTopWindow = () => window == window.top;

		// load browser db to store keys
		const { ImmortalDB } = await import('immortal-db');
		const storedValue = await ImmortalDB.get(SAVED_KEY, def);

		handleConnect = () => {
			console.log('Handling connect');
			connected = true;

			if (storedValue) {
				parsedStore = new Uint8Array(Object.values(JSON.parse(storedValue)));
				let pre_name = handlers.newProxcryptor(parsedStore);
				console.log({ pre_name });
				keys = handlers.getLoadedKeys();
				console.log({ keys });
			}

			console.log(`Replying ${CONSTANTS.CONTRACT}`);
			window.parent.postMessage(`${CONSTANTS.CONTRACT}`, '*');
		};

		handleGenerateKeypair = () => {
			console.log('Generating keypair');
			const { publicKey, secretKey } = handlers.generateEd25519Keypair();
			ImmortalDB.set(SAVED_KEY, JSON.stringify(new Uint8Array(secretKey)));
			handlers.newProxcryptor(secretKey);
			keys = handlers.getLoadedKeys();
		};

		handlers.initialize().then((r) => {
			// let parent know this iframe is ready to initialize
			if (isTopWindow()) {
				console.log('In Top.');
				// We're not in an iframe, we're at the top, baby
				if (!handlers.connect(location.origin)) return; // do we want user to click connect? Or do it for them?
				handleConnect();
			} else if (r.status == CONSTANTS.INITIALIZED) {
				window.parent.postMessage(`${CONSTANTS.INITIALIZED}`, '*');
				window.parent.postMessage(`${CONSTANTS.EXPAND}`, '*');
			}
		});

		/**
		 * Handle incoming messages to the iFrame
		 */
		handleMessage = async (event) => {
			if (!event.ports[0]) return; // skip if not a port-port message

			const reply = (r) => {
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
				if (method === 'connect') args = [event.origin]; // connect is the only method that needs the origin passed in? {...args, origin: event.origin}
				result = await fn(...args);
				if (method === 'connect' && result.status == CONSTANTS.CONNECTED) handleConnect();
				reply(result);
			} catch (error) {
				let err = new Error(`RPC error calling ${method}(${params.toString()})`);
				console.error(err);
				reply(err);
			}
		};
	});
</script>

<svelte:window on:message={handleMessage} />
<h2>Custom Graphic? 🕳️🔑</h2>

{#if isTopWindow && isTopWindow() && handleGenerateKeypair}
	<h2>PeerPiper Portal Keychain</h2>
	<p>
		This wallet is embedded in an iframe in the host's website, so the contexts are different and
		keys are safe. Yet the two can talk via postMessage to encrypt & sign with your keys.
	</p>
	{#if connected && !keys}
		<button class={'green'} on:click={handleGenerateKeypair}>Create New Keypair</button>
	{/if}
	{#if keys}
		{#each keys as key}
			Connected to <b>{key.publicKeyBase58}</b>
		{/each}
	{/if}
{/if}

<style>
	/* div.attention {
		display: flex;
		flex-direction: column;
		margin: 1em 0;
		background-color: lightyellow;
		width: fit-content;
		padding: 1em;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	} */

	button.green {
		background-color: #4caf50;
	}
	button {
		border: none;
		color: white;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		margin-left: auto;
		margin-top: 0.5em;
		margin-bottom: 1em;
		border-radius: 2px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	}
</style>
