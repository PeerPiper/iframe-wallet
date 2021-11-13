<script>
	import '../app.css';

	import { onMount } from 'svelte';
	import * as CONSTANTS from '$lib/handlers/constants';
	import { handlers, setHost } from '$lib/handlers';
	import { page } from '$app/stores';
	import { confirm, confirmSection, keypairs } from './stores';

	import { confirmationComponents } from '$lib/handlers/confirm';
	import { privateKeyJwkFromEd25519bytes, jwkToSecretBytes } from './handlers/ed25519/utils';
	import ListKeys from './utils/ListKeys.svelte';

	let offsetWidth;
	let offsetHeight;

	const leaf = (obj, path) => path.split('.').reduce((value, el) => value && value[el], obj);

	let active; // active confirmation UI component
	// $: active = confirmationComponents[$confirmSection] || false; // picked by $confirm fn below
	$: active = $confirmSection ? leaf(confirmationComponents, $confirmSection) : false; // picked by $confirm fn below

	let handleConfirmed;
	let handleDenied;

	// set confirm fn
	$confirm = async (methodName, params) => {
		$confirmSection = methodName;
		return new Promise((resolve, reject) => {
			handleConfirmed = () => {
				$confirmSection = null; // reset UI
				resolve(true); // signal handler to continue with action
			};
			handleDenied = () => {
				$confirmSection = null; // reset UI
				resolve(false); // signal handler to continue with action
			};
		});
	};

	setHost($page.host);

	let result;
	let publicKeys;
	let handleMessage;
	let handleGenerateKeypair;
	let connected;
	let isTopWindow;

	let method;

	const SAVED_KEYS = '__SAVED_KEY';
	const def = null;

	let widthReply;
	let heightReply;

	$: offsetWidth && widthReply && widthReply(offsetWidth);
	$: offsetHeight && heightReply && heightReply(offsetHeight);

	$: if ($keypairs) {
		publicKeys = handlers.getLoadedKeys();
	}

	onMount(async () => {
		// TODO: Split RPC into local only and remote access?
		isTopWindow = () => window == window.top;

		// load browser db to store keypairs
		const { ImmortalDB } = await import('immortal-db');
		const storedValue = await ImmortalDB.get(SAVED_KEYS, def);

		function handleConnect() {
			connected = true;

			if (storedValue) {
				// TODO: Password protect first
				const kps = JSON.parse(storedValue);
				handlers.importKeypairs(kps);
				$keypairs = $keypairs;
			}
		}

		handleGenerateKeypair = async () => {
			console.log('Creating keypairs');
			// ed25519
			const { publicKey, secretKey } = handlers.generateEd25519Keypair();
			const ed25519secretJWK = await privateKeyJwkFromEd25519bytes(secretKey, publicKey);
			console.log({ ed25519secretJWK });

			// RSA for arweave
			// @ts-ignore
			let rsaSecretJWK = await handlers.arweaveWalletAPI.generateJWK();

			// TODO: Password protect first
			await ImmortalDB.set(SAVED_KEYS, JSON.stringify([ed25519secretJWK, rsaSecretJWK]));
			console.log('Saved. Importing');

			handlers.importKeypairs([ed25519secretJWK, rsaSecretJWK]);
			$keypairs = $keypairs;
		};

		handlers.initialize().then(async (r) => {
			// let parent know this iframe is ready to initialize
			if (isTopWindow()) {
				console.log('is top');
				// We're not in an iframe, we're at the top, baby
				let allowed = await handlers.connectWallet(location.origin);
				if (!allowed) return; // do we want user to click connect? Or do it for them?
				handleConnect();
			} else if (r.status == CONSTANTS.INITIALIZED) {
				window.parent.postMessage(`${CONSTANTS.INITIALIZED}`, '*');
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

			// handle UI resize
			if (event.data == 'offsetWidthChannel') {
				// whenever width changes, post msg on this channel
				widthReply = (width) => event.ports[0].postMessage(width);
				return;
			}
			if (event.data == 'offsetHeightChannel') {
				heightReply = (height) => event.ports[0].postMessage(height);
				return;
			}

			method = event.data?.method;
			let params = event.data?.params;

			const leaf = (obj, path) => path.split('.').reduce((value, el) => value && value[el], obj);
			// console.log(`method ${method} in handlers: `, leaf(handlers, method));

			if (!(method in handlers) && !leaf(handlers, method)) {
				reply({ status: CONSTANTS.ERROR_METHOD_NOT_FOUND });
				return;
			}

			/**
			 * Passed all criteria, call the RPC function
			 */
			try {
				let fn = handlers[method] || leaf(handlers, method);
				// console.log({ fn });
				let args = params ? params : [];
				if (method === 'connectWallet') args = [event.origin]; // connectWallet is the only method that needs the origin passed in? {...args, origin: event.origin}
				// console.log({ fn }, fn.name, { args });
				result = await fn(...args);
				if (method === 'connectWallet' && result.status == CONSTANTS.CONNECTED) handleConnect();
				reply(result);
			} catch (error) {
				let err = new Error(`RPC error calling ${method}(${params.toString()})`);
				console.error(err);
				reply(err);
			}
			method = null; // reset component props
		};
	});
</script>

active: {active}
<svelte:window on:message={handleMessage} />

<main bind:offsetWidth bind:offsetHeight>
	<!-- App: {offsetWidth} x {offsetHeight}<br /> -->
	<!-- Confirmation Section -->
	{#if active}
		<div class="active">
			<svelte:component
				this={active.component}
				props={method || 'connectWallet'}
				on:confirmed={handleConfirmed}
				on:denied={handleDenied}
			/>
		</div>
	{/if}

	<!-- Back Officer Section -->
	{#if isTopWindow && isTopWindow() && handleGenerateKeypair}
		<h2>PeerPiper Portal Keychain 🕳️🔑</h2>
		<p>
			This wallet is embedded in an iframe in the host's website, so the contexts are different and
			keypairs are safe. Yet the two can talk via postMessage to encrypt & sign with your keypairs.
		</p>
		{#if connected && $keypairs.size < 1}
			<div class="submit">
				No keypairs detected in this browser.
				<button class={'green'} on:click={handleGenerateKeypair}>Create New Keypairs</button>
			</div>
		{/if}
		{#if publicKeys}
			<ListKeys keys={publicKeys} />
		{/if}
	{/if}
</main>

<style>
	main {
		margin: 1em;
		min-width: 100px;
		min-height: 2px;
		width: fit-content;
	}
	.active {
		/* width: 500px;
		height: 250px; */
		min-width: 400px;
		min-height: 200px;
	}
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
