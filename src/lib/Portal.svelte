<script lang="ts">
	import { onMount } from 'svelte';

	import IFrame from './IFrame.svelte';
	import * as CONSTANTS from '../../../iframe-wallet/src/lib/constants';
	import { config, remote } from './remote-rpc';
	import Controller from './Controller.svelte';

	// export let encrypt;
	export let origin = 'http://localhost:3444'; // https://wallet.peerpiper.io/ ?

	let portalLoaded = false;
	let iframe: HTMLIFrameElement;
	let connected;
	let mounted;
	let expand;

	// allow users to bind to the portal
	export let portal;

	let aggregated = {
		// inherit all super from remote handlers
		...remote,
		CONSTANTS // re-export for convenience
	};

	// only expose the aggregated object once connected
	$: if (connected) portal = aggregated;

	// Wait for the iframe to load, then configure it
	const handleLoad = async () => {
		config({ iframe, origin });
	};

	const handleMessage = async (event) => {
		if (event.data == CONSTANTS.INITIALIZED) portalLoaded = true;
		if (event.data == CONSTANTS.EXPAND) expand(true); // modal style interaction
		if (event.data == CONSTANTS.CONTRACT) expand(false); // modal style interaction
	};

	$: iframe && iframe.addEventListener('load', handleLoad);

	onMount(async () => {
		mounted = true; // Parent needs to mount first, to ensure the iframe listener is added
	});
</script>

<svelte:window on:message={handleMessage} />

{#if mounted}
	<Controller {origin} bind:portalLoaded bind:expand portal={aggregated} bind:connected>
		<IFrame bind:iframe {origin} />
	</Controller>
{/if}
