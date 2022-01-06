<script>
	import '../app.css';

	import { onMount } from 'svelte';

	import * as CONSTANTS from '$lib/handlers/constants';
	import { handlers, setHost } from '$lib/handlers';
	import { page } from '$app/stores';
	import { confirm, confirmSection, keypairs } from './stores';
	import { confirmationComponents } from '$lib/handlers/confirm';

	import ListKeys from './utils/ListKeys.svelte';
	import logo from './graphics/peerpiper-logo.svg';

	import FrontEnd from './FrontEnd.svelte';
	import BackEnd from './BackEnd.svelte';

	const OPENED_SIGNAL = 'OPENED';
	const KEYS_SYNC = 'KEYS_SYNC';
	const SAVED_KEYS = '__SAVED_KEY';
	const def = null;

	const leaf = (obj, path) => path.split('.').reduce((value, el) => value && value[el], obj);

	let active; // active confirmation UI component

	let maxOffsetWidth = 900;
	let maxOffsetHeight = 950;

	let offsetWidth;
	let offsetHeight;

	// state
	let topUrl;
	let publicKeys;
	let connected;
	let storedValue;
	let stayConnected;

	// variables
	let method;
	let params;

	// functions
	let widthReply;
	let heightReply;
	let getStoredKeys;
	let handleMessage;
	let handleDisconnect;
	let handleExportKeypair;
	let handleConfirmed;
	let handleDenied;
	let isTopWindow;
	let importKeys;

	// set confirm fn
	$confirm = async (methodName, args) => {
		$confirmSection = methodName;
		params = args;
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

	setHost($page.url.host);

	// Reactive statements
	$: active = $confirmSection ? leaf(confirmationComponents, $confirmSection) : false; // picked by $confirm fn below
	$: offsetWidth && widthReply && widthReply(offsetWidth);
	$: offsetHeight && heightReply && heightReply(offsetHeight);

	$: if ($keypairs)
		(async () => {
			publicKeys = await handlers.getLoadedKeys();
		})();

	onMount(async () => {
		// TODO: Split RPC into local only and remote access?
		isTopWindow = () => window == window.top;
		topUrl = self === top ? document.URL : document.referrer;

		/** This wallet design is all about getting keys into/from the browser context storage So we need to check storage, load, or import as require. Use Immortal to provide triple redundancy against deletion loss */
		const { ImmortalDB } = await import('immortal-db');

		getStoredKeys = async () => {
			storedValue = await ImmortalDB.get(SAVED_KEYS, def);
			return storedValue;
		};

		await getStoredKeys();

		// Initialize the wasm in the keychain
		const initResp = await handlers.initialize();

		if (!isTopWindow() && initResp.status == CONSTANTS.INITIALIZED)
			window.parent.postMessage(`${CONSTANTS.INITIALIZED}`, '*'); // we're in an iframe, window.parent will receive the initialized message so it knows it can now interact with the wallet handlers

		importKeys = async (keyArray) => {
			// TODO: Password protect first
			const promise1 = ImmortalDB.set(SAVED_KEYS, JSON.stringify(keyArray));
			const promise2 = handlers.importKeypairs(keyArray);
			await Promise.all([promise1, promise2]); // parallel processing
			await getStoredKeys(); // set storedValue

			$keypairs = $keypairs;
			connect(); // import should trigger a connect
		};

		connect(); // connect by default?

		async function connect() {
			let allowed = await handlers.connectWallet(topUrl);
			if (!allowed) return; // do we want user to click connect? Or do it for them?
			handleConnected();
		}
		function handleConnected() {
			connected = true;

			window?.parent?.postMessage(CONSTANTS.CONNECTED, '*'); // send window.parent message so it knows it can now interact with the wallet handlers

			if (stayConnected) {
				handlers.stayConnected(); // internally skips the confirmation step
				window.sessionStorage.setItem('stayConnected', 'true'); // set flag local to autoconnect
			}

			if (storedValue) {
				// TODO: Password protect first
				const kps = JSON.parse(storedValue);
				handlers.importKeypairs(kps);
				$keypairs = $keypairs;
			}
		}

		// TODO: handle export
		handleExportKeypair = () => {
			// TODO: Password protect first
			const kps = JSON.parse(storedValue);
		};

		handleDisconnect = () => {
			window.sessionStorage.removeItem('stayConnected');
			const reply = handlers.disconnect();
			if (reply.status == CONSTANTS.DISCONNECTED) connected = false;
		};

		/**
		 * Handle incoming messages to the iFrame
		 */
		handleMessage = async (event) => {
			method = event?.data?.method;
			let parameters = event?.data?.params;

			// handle parent body size
			if (event.data?.msg == 'maxOffsetWidth') {
				maxOffsetWidth = event.data.size;
				return;
			}
			// handle parent body size
			if (event.data?.msg == 'maxOffsetHeight') {
				maxOffsetHeight = event.data.size;
				return;
			}

			// Ports used after this point
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
				heightReply = async (height) => {
					event.ports[0].postMessage(height);
				};
				return;
			}

			// methods only after this point
			if (!method) return;

			// console.log({ method });

			// const leaf = (obj, path) => path.split('.').reduce((value, el) => value && value[el], obj);
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
				// console.log( fn );
				let args = parameters ? parameters : [];
				if (method === 'connectWallet') args = [topUrl]; // connectWallet is the only method that needs the origin passed in? {...args, origin: event.origin}
				// console.log({ fn }, fn?.name, { args });
				const result = await fn(...args);
				if (method === 'connectWallet' && result.status == CONSTANTS.CONNECTED) handleConnected();
				reply(result);
			} catch (error) {
				let err = new Error(`RPC error calling ${method}(${parameters.toString()})`);
				console.error(err);
				reply(err);
			}
			method = null; // reset component props
		};
	});
</script>

<svelte:window on:message={handleMessage} />

<div class="wrapper" bind:offsetWidth bind:offsetHeight>
	<main>
		<!-- The Web3 Wallet -->
		<!-- style="max-width: {maxOffsetWidth}px; max-height: {maxOffsetHeight}px;" -->
		<!-- offset: {offsetWidth} x {offsetHeight}<br /> -->
		<!-- Max offset: {maxOffsetWidth} x {maxOffsetHeight}<br /> -->
		<!-- Confirmation Section -->
		{#if active && !!storedValue}
			<div class="active">
				<svelte:component
					this={active.component}
					props={{ method: $confirmSection, params }}
					on:confirmed={handleConfirmed}
					on:denied={handleDenied}
				/>
			</div>
		{/if}

		{#if isTopWindow !== undefined && !isTopWindow()}
			<FrontEnd
				{storedValue}
				{connected}
				{topUrl}
				bind:stayConnected
				{handleDisconnect}
				{importKeys}
				{OPENED_SIGNAL}
				{KEYS_SYNC}
			/>
		{:else}
			<BackEnd
				{handlers}
				{importKeys}
				{storedValue}
				{getStoredKeys}
				bind:stayConnected
				{OPENED_SIGNAL}
				{KEYS_SYNC}
			/>
		{/if}

		{#if publicKeys}
			<ListKeys keys={publicKeys} />
			<!-- TODO: Export keys as desired
			{#if $keypairs.size > 0}
					<div class="submit">
						Export Keys
						<button class={'green'} on:click={handleExportKeypair}>Export Key</button>
					</div>
			{/if} 
			-->
		{/if}
		<footer>
			<smaller
				><img src={logo} alt="peerpiper" />
				<div class="powered">
					Powered by:
					<a href="https://PeerPiper.io" target="_blank" rel="noreferrer">PeerPiper</a>
				</div></smaller
			>
		</footer>
	</main>
</div>

<style>
	.powered {
		background-color: #fafbfd;
	}
	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0.75em;
	}
	footer > smaller {
		display: inline-flex;
	}
	.wrapper {
		padding: 0px;
		margin: 0px;
		width: fit-content;
		height: auto;
	}

	main {
		margin: 14px;
		min-width: 300px;
		min-height: fit-content;
		width: fit-content;
		height: fit-content;
		overflow-wrap: break-word;
		word-break: break-word;
		display: flex;
		flex-direction: column;
	}
	.active {
		display: flex;
		align-items: center;
		min-width: 350px;
		min-height: 50px;
		flex-direction: column;
	}

	img {
		width: 1.1em;
		height: 1.1em;
		object-fit: contain;
	}
</style>
