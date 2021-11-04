<script>
	import { quintOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';

	export let origin;
	export let portalLoaded = false;
	export let portal;
	export let connected;

	let loading;
	let keys;

	let offsetWidth;
	let offsetHeight;

	let opacity = 32; // percent

	$: shortKey =
		keys && keys.length > 0
			? keys[0]?.publicKeyBase58.slice(0, 3) +
			  '...' +
			  keys[0]?.publicKeyBase58.slice(
					keys[0]?.publicKeyBase58.length - 5,
					keys[0]?.publicKeyBase58.length - 1
			  )
			: 'sk';

	// modal params
	let intial = 20;
	let duration = 750;
	let easing = quintOut;

	// interpolate the dimensions
	const width = tweened(intial, {
		duration,
		easing
	});

	const height = tweened(intial, {
		duration,
		easing
	});

	// trigger when expand toggles
	export const expand = (opening) => {
		opacity = opening ? 90 : 32;
		$width = opening ? 80 : intial;
		$height = opening ? 50 : intial;
	};

	const handleConnect = async () => {
		// @ts-ignore
		loading = portal.connect().then(async (r) => {
			loading = null;
			console.log({ r });
			if (r.status == portal.CONSTANTS.CONNECTED) {
				console.log({ r });
				connected = true;
			}
			keys = await portal.getLoadedKeys();
		});
	};

	const handleDisconnect = async () => {
		// @ts-ignore
		portal.disconnect().then((reply) => {
			if (reply.status == portal.CONSTANTS.CONNECTED) connected = false;
		});
	};
</script>

<div
	class="container"
	style="--container-min-width: {$width}%;--container-min-height: {$height}%;--opacity: {opacity}%;"
>
	<div class="inner-container" bind:offsetWidth bind:offsetHeight>
		<small><a href={origin} target="_blank" rel="noreferrer">Open in new window ↗️</a></small>
		{#if !connected}
			<div class="header">
				<b>PeerPiper Portal Keychain 🕳️🔑</b>
				<input bind:value={origin} />
			</div>
			<button
				disabled={!portalLoaded || connected}
				class={!portalLoaded ? 'red' : loading ? 'yellow' : 'ready'}
				on:click|preventDefault={handleConnect}>Connect</button
			><br />
		{:else}
			<button disabled={!connected} class="ready" on:click|preventDefault={handleDisconnect}
				>Disconnect from
				{shortKey}
			</button><br />
		{/if}

		<!-- iframe slot -->
		<div>
			<slot />
		</div>

		<small>
			<p>size: {offsetWidth}px x {offsetHeight}px</p>
			<p>min-size: {$width}% x {$height}%</p>
		</small>
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
	.inner-container {
		display: block;
		height: 100%;
	}
	.container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-content: flex-start;

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
		width: 100px;
		height: 200px;
	}
	.header {
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: stretch;
		align-content: stretch;
	}
	input {
		margin: 0.5em 0;
		padding: 0.4em 0.6em;
		border-width: 1px;
		border-style: inset;
		max-width: fit-content;
	}
	button.green {
		background-color: #4caf50;
	}
	button.yellow {
		background-color: rgb(230, 208, 10, var(--opacity));
	}
	button.ready {
		background-color: rgb(47, 137, 255);
	}
	button.red {
		background-color: rgb(196, 60, 60);
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
