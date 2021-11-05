<script>
	import { elasticOut, quintOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { scale, slide } from 'svelte/transition';

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
	const minWidth = tweened(intial, {
		duration,
		easing
	});

	const minHeight = tweened(intial, {
		duration,
		easing
	});

	// trigger when expand toggles
	export const expand = (opening) => {
		opacity = opening ? 50 : 30; // change overlay opacity when expanded?
		$minWidth = opening ? 80 : intial;
		$minHeight = opening ? 50 : intial;
	};

	const handleConnect = async () => {
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
		portal.disconnect().then((reply) => {
			if (reply.status == portal.CONSTANTS.DISCONNECTED) connected = false;
		});
	};
</script>

<div
	class="container"
	style="--container-min-width: {$minWidth}%;--container-min-height: {$minHeight}%;--opacity: {opacity}%;"
>
	<div class="inner-container" bind:offsetWidth bind:offsetHeight>
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
					<b>PeerPiper Portal Keychain 🕳️🔑</b>
					<input bind:value={origin} />
				</div>
				<button
					disabled={!portalLoaded || connected}
					class={!portalLoaded ? 'red' : loading ? 'yellow' : 'ready'}
					on:click|preventDefault={handleConnect}>Connect</button
				><br />
			</div>
		{:else}
			<!-- completely gratuitous transitions -->
			<div
				transition:scale={{
					duration,
					delay: duration,
					easing: elasticOut
				}}
			>
				<button disabled={!connected} class="ready" on:click|preventDefault={handleDisconnect}
					>Disconnect from
					{shortKey}
				</button><br />
			</div>
		{/if}

		<!-- iframe slot -->
		<div name="iframe-slot">
			<slot />
		</div>
		<small>
			<span>size: {offsetWidth}px x {offsetHeight}px</span><br />
			<span>min-size: {$minWidth}% x {$minHeight}%</span>
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
