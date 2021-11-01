<script lang="ts">
	import { onMount } from 'svelte';

	import IFrame from './IFrame.svelte';
	import * as CONSTANTS from '../../../iframe-wallet/src/lib/constants';
	import { config, remote } from './remote-rpc';

	// export let encrypt;
	export let origin = 'http://localhost'; // https://wallet.peerpiper.io/ ?

	export let portalLoaded = false;
	let iframe: HTMLIFrameElement;

	let mounted;

	// Wait for the iframe to load, then configure it
	export const handleLoad = async () => {
		config({ iframe, origin });
	};

	const handleMessage = async (event) => {
		if (event.data == CONSTANTS.READY) handleReady();
	};

	const handleReady = async () => {
		// @ts-ignore
		let reply = await remote.initialize();
		// console.log({ initilize: reply });
		// if (reply.status == CONSTANTS.INITIALIZED) // TODO: Implement once API stabalizes?
		portalLoaded = true;
	};

	$: iframe && iframe.addEventListener('load', handleLoad);

	onMount(async () => {
		mounted = true; // Parent needs to mount first, to ensure the iframe listener is added
	});

	export const portal = {
		// inherit all super from remote handlers
		...remote,
		/**
		 * Optional: If you want to extend the inherited functions from handlers,
		 * such as additional name (ie. in camelCase) or change the output type (Uint8Array)
		 * call await remote.<method> below and add your functionality
		 */
		CONSTANTS // re-export for convenience
	};
</script>

<svelte:window on:message={handleMessage} />

{#if mounted}
	<IFrame bind:iframe src={origin} />
{/if}
