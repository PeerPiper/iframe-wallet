<script>
	import { onMount } from 'svelte';
	import * as CONSTANTS from './handlers/constants';

	import { keypairs } from './stores';
	import { scale, slide } from 'svelte/transition';

	// passed properties from parent
	export let storedValue;
	export let connected;
	export let topUrl;
	export let stayConnected;
	export let handleDisconnect;
	export let importKeys;
	export let OPENED_SIGNAL;
	export let KEYS_SYNC;

	let duration = 700;

	// function names assigned only after component loads in DOM
	let openTwinWindow;
	let handleMessage;

	// state variables
	let connecting;
	let openedWindow;

	onMount(async () => {
		// If 1) is NOT top AND 2) No keys are stored a new twin window must be opened so that the user can generate keys, in the top window
		openTwinWindow = () => {
			connecting = true;
			openedWindow = window.open(window.location.origin, '_blank'); // open the same domain to provide maximum security.
		};

		handleMessage = async (event) => {
			if (event.data == OPENED_SIGNAL) {
				event.ports[0].postMessage(topUrl);
				return;
			}

			if (event.data.key == KEYS_SYNC) {
				await importKeys(JSON.parse(event.data.data)); // import the keys here in this browser context
				event.ports[0].postMessage('Imported'); // send ack back to master so it can remove "pending" label for this window
			}
		};
	});

	$: if (storedValue) {
		// console.log({ storedValue }, 'sending CONNECTED');
		// window.parent.postMessage(CONSTANTS.CONNECTED, '*'); // send window.parent message so it knows it can now interact with the wallet handlers
	}
</script>

<svelte:window on:message={handleMessage} />

{#if storedValue !== undefined && storedValue === null && $keypairs.size < 1 && !connected}
	<div
		in:scale={{
			duration,
			delay: duration
			// easing: elasticOut
		}}
		out:slide={{
			duration,
			delay: duration
			// easing: elasticOut
		}}
	>
		<button
			disabled={connecting}
			class={connecting ? 'yellow' : 'ready'}
			on:click|preventDefault={openTwinWindow}>{connecting ? 'Connecting' : 'Connect'}</button
		><br />
		<div style={connecting ? 'display: none;' : ''}>
			<input type="checkbox" bind:checked={stayConnected} /> Stay Connected
		</div>
	</div>
{:else if connected}
	<div>
		<button disabled={!connected} class="ready" on:click|preventDefault={handleDisconnect}
			>Disconnect Wallet
		</button>
	</div>
{/if}
