<script>
	import { onMount } from 'svelte';
	import { elasticOut, quintOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { scale, slide } from 'svelte/transition';
	import { confirmSection } from './stores.js';
	import ListKeys from './utils/ListKeys.svelte';

	export let origin;
	export let portalLoaded = false;
	export let portal;
	export let connected;

	let connecting;
	let keys;
	let stayConnected;

	let closedOpacity = 15;
	let opacity = closedOpacity; // percent
	let duration = 750;

	const handleConnect = async () => {
		connecting = portal.connectWallet().then(async (r) => {
			connecting = null;
			if (r.status !== portal.CONSTANTS.CONNECTED) return;
			connected = true;
			if (stayConnected) {
				portal.stayConnected();
				window.sessionStorage.setItem('stayConnected', 'true'); // set flag local to autoconnect
			}
			keys = await portal.getLoadedKeys();
		});
	};

	const handleDisconnect = async () => {
		window.sessionStorage.removeItem('stayConnected');
		portal.disconnect().then((reply) => {
			if (reply.status == portal.CONSTANTS.DISCONNECTED) connected = false;
		});
	};

	//check auto connect
	$: if (portalLoaded && sessionStorage.getItem('stayConnected') == 'true') handleConnect();
</script>

<div class="container" style="--opacity: {opacity}%;">
	<small><a href={origin} target="_blank" rel="noreferrer">Open in new window ↗️</a></small>
	{#if !connected}
		<!-- completely gratuitous transitions -->
		<div
			out:slide={{
				duration,
				delay: duration,
				easing: elasticOut
			}}
			in:scale={{
				duration,
				delay: duration,
				easing: elasticOut
			}}
		>
			<div class="header">
				<input bind:value={origin} />
			</div>
			<button
				disabled={!portalLoaded || connected}
				class={!portalLoaded ? 'red' : connecting ? 'yellow' : 'ready'}
				on:click|preventDefault={handleConnect}
				>{!portalLoaded ? 'Loading...' : connecting ? 'Connecting' : 'Connect'}</button
			><br />
			<input type="checkbox" bind:checked={stayConnected} /> Stay Connected
		</div>
	{:else}
		<!-- completely gratuitous transitions -->
		<div
			in:scale={{
				duration,
				delay: duration,
				easing: elasticOut
			}}
			out:slide={{
				duration,
				delay: duration,
				easing: elasticOut
			}}
		>
			<button disabled={!connected} class="ready" on:click|preventDefault={handleDisconnect}
				>Disconnect Wallet
			</button><br />
			<ListKeys {keys} />
		</div>
	{/if}

	<!-- iframe slot -->
	<div name="iframe-slot">
		<slot {stayConnected} />
	</div>
</div>

<style>
	a {
		text-decoration: dashed;
		color: rgb(0, 16, 161);
	}
	div {
		display: block;
		overflow: hidden;
	}

	.container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-content: flex-start;
		align-items: flex-end;
		text-align: right;

		position: fixed;
		top: 10px;
		right: 10px;
		background-color: rgb(162 162 162 / var(--opacity));
		border: 1px solid rgb(162 162 162 / var(--opacity));
		padding: 0.5em;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;
		border-radius: 4px;
		z-index: 99 !important;
		min-width: var(--container-min-width);
		min-height: var(--container-min-height);
	}
	.header {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: flex-end;
		align-content: stretch;
	}
	input {
		margin: 0.5em 0;
		padding: 0.4em 0.6em;
		border-width: 1px;
		border-style: inset;
		max-width: fit-content;
	}

	button.yellow {
		background-color: rgb(230, 208, 10, 0.82);
	}
	button.ready {
		background-color: rgb(47, 137, 255, 0.82);
	}
	button.red {
		background-color: rgb(196, 60, 60, 0.82);
	}
	button {
		border: none;
		color: white;
		padding: 15px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-size: 16px;
		margin: 0.5em 0;
		border-radius: 2px;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	}
</style>
