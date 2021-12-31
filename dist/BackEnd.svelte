<script>
	import { onMount } from 'svelte';
	import { keypairs } from './stores';

	import { privateKeyJwkFromEd25519bytes } from './handlers/ed25519/utils';
	import logo from './graphics/peerpiper-logo.svg';

	// passed properties from parent
	export let handlers;
	export let importKeys;
	export let getStoredKeys;
	export let storedValue;
	export let KEYS_SYNC;
	export let OPENED_SIGNAL;
	export let stayConnected;

	stayConnected = true; // by default just connect on the backend

	// function names assigned only after component loads in DOM
	let handleGenerateKeypair;
	let syncKeys;

	// state variables
	let creating = '';
	let pending;

	onMount(async () => {
		// If this window is the created Twin of the opener window
		if (window.location.origin === window.opener?.origin)
			sendOpenerMsg(OPENED_SIGNAL, (event) => (pending = event.data)); // persists after refresh -- keep a whitelist?

		function sendOpenerMsg(msg, callback = (_) => {}) {
			const channel = new MessageChannel();
			channel.port1.onmessage = callback; // Listen for messages on port1
			window.opener.postMessage(msg, window.location.origin, [channel.port2]); // the opener will receive this message
		}

		handleGenerateKeypair = async () => {
			creating = ' Creating keypairs...';

			// ed25519
			const { publicKey, secretKey } = await handlers.generateEd25519Keypair();
			const promise1 = privateKeyJwkFromEd25519bytes(secretKey, publicKey);

			// @ts-ignore
			const promise2 = handlers.arweaveWalletAPI.generateJWK(); // RSA for arweave

			const [ed25519secretJWK, rsaSecretJWK] = await Promise.all([promise1, promise2]);

			await importKeys([ed25519secretJWK, rsaSecretJWK]);
		};

		// Called when user allows a copy of the keys to be imported to another browser window in same origin
		syncKeys = async () => {
			const onComplete = (event) => {
				pending = null;
			};
			await getStoredKeys(); // should refresh storedValue with keys after await has resolved
			sendOpenerMsg({ key: KEYS_SYNC, data: storedValue }, onComplete); // uses same origin, kets are secure
		};
	});
</script>

<!-- Back Office Section -->
<section>
	{#if handleGenerateKeypair}
		<h1><img src={logo} alt="peerpiper" /> PeerPiper Web3 Wallet 🔑</h1>
		<p>
			This wallet is embedded in an iframe in the host's website, so the contexts are different and
			keypairs are safe. Yet the two can talk via postMessage to encrypt & sign with your keypairs.
		</p>
		{#if pending && $keypairs.size > 0}
			Pending request from {pending}
			<button on:click={syncKeys} class={'green'}>Authorize</button>
		{/if}
		{#if storedValue !== undefined && storedValue === null}
			{#if $keypairs.size < 1}
				<div class="submit">
					No keypairs detected in this browser.
					<button class={'green'} on:click={handleGenerateKeypair}>Create New Keypairs</button>
					{creating}
				</div>
			{/if}
		{/if}
	{/if}
</section>

<style>
	section {
		margin: 40px;
	}
	img {
		width: 1.1em;
		height: 1.1em;
		object-fit: contain;
	}
</style>
