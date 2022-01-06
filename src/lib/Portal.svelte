<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';

	import IFrameComp from './IFrame.svelte';
	import * as CONSTANTS from './handlers/constants';
	import { config, remote } from './remote-rpc';
	import Controller from './Controller.svelte';

	// export let encrypt;
	export let portal; // allow users to bind to the portal
	export let origin; // allow users to set the origin default

	const dispatch = createEventDispatcher();

	let portalLoaded = false;
	let iframe: HTMLIFrameElement;
	let connected;
	let mounted;

	let offsetWidth;
	let offsetHeight;

	let forceDisplay = true; // force the portal to display if hidden when a popup happens

	let aggregated = {
		// inherit all super from remote handlers
		...remote,
		CONSTANTS // re-export for convenience
	};

	$: if (connected) {
		// remote.arweaveWalletAPI.connect(['SIGN_TRANSACTION']);
		// set the arweave wallet to use our portal
		window.arweaveWallet = remote.arweaveWalletAPI;
		window.portal = remote;
		window.addEventListener('arweaveWalletLoaded', async () => {
			/** Handle ArConnect load event, in case user has another arweave wallet installed **/
			window.arweaveWallet = remote.arweaveWalletAPI; // overwite again as needed
		});
		// only expose the fully aggregated API on connect, so consumers know when it's ready
		// but we can use the aggregated internally until then
		portal = aggregated;

		dispatch('connected', 'portal loaded'); // so listeners can tell when the portal can be used
	}

	// Wait for the iframe to load, then configure it
	const handleLoad = async () => {
		config({ iframe, origin });
	};

	const handleMessage = async (event) => {
		if (event.data == CONSTANTS.INITIALIZED) {
			setMaxDimensions();
			syncWidth();
			syncHeight();
			portalLoaded = true;
		}

		if (event.data == CONSTANTS.CONNECTED) {
			connected = true;
		}
	};

	$: iframe && iframe.addEventListener('load', handleLoad);

	onMount(async () => {
		mounted = true; // Parent needs to mount first, to ensure the iframe listener is added
	});

	$: portalLoaded && document.body.clientWidth && setMaxDimensions();

	function setMaxDimensions() {
		iframe.contentWindow.postMessage(
			{ msg: 'maxOffsetWidth', size: document.body.clientWidth },
			origin
		);
		iframe.contentWindow.postMessage(
			{ msg: 'maxOffsetHeight', size: document.body.clientHeight },
			origin
		);
	}

	function syncWidth() {
		// Listen for messages on port1
		const channel = new MessageChannel();
		channel.port1.onmessage = (e) => (offsetWidth = e.data);
		// Transfer port2 to the iframe
		iframe.contentWindow.postMessage('offsetWidthChannel', '*', [channel.port2]);
	}

	function syncHeight() {
		// Listen for messages on port1
		const channel = new MessageChannel();
		channel.port1.onmessage = (e) => (offsetHeight = e.data);
		// Transfer port2 to the iframe
		iframe.contentWindow.postMessage('offsetHeightChannel', '*', [channel.port2]);
	}

	$: if (offsetHeight > 100) {
		forceDisplay = true;
	}
</script>

<svelte:window on:message={handleMessage} on:resize={setMaxDimensions} />

{#if mounted}
	<Controller bind:origin bind:display={forceDisplay} {connected}>
		<!-- Portal {offsetWidth} x {offsetHeight}<br /> -->
		<IFrameComp bind:iframe {origin} {offsetWidth} {offsetHeight} />
	</Controller>
{/if}
