<script>
	import { onMount } from 'svelte';
	import { elasticOut, quintOut } from 'svelte/easing';
	import { scale, slide } from 'svelte/transition';
	import { tweened } from 'svelte/motion';

	import ListKeys from './utils/ListKeys.svelte';
	import Dragger from './graphics/Dragger.svelte';
	import Draggable from './graphics/Draggable.svelte';
	import toggle from './graphics/toggle.svg';
	import { shortenURL } from './utils';

	export let origin = 'http://localhost:3444'; // https://wallet.peerpiper.io/  // default values
	export let display = true;
	export let connected;

	let closedOpacity = 20;
	let openOpacity = 20;
	let opacity = openOpacity; // percent
	let duration = 700;

	let offsetWidth;
	let offsetHeight;

	let initalWidth;
	let initalHeight;

	let x;
	let y;
	const CACHED_ORIGIN = 'CACHED_ORIGIN';
	let cacheOrigin;

	const easing = quintOut;

	// interpolate the dimensions
	let calcWidth;

	// interpolate the dimensions
	let calcHeight;

	onMount(async () => {
		x = -10; // 10 px from the right on component mounted
		y = 10;

		const { ImmortalDB } = await import('immortal-db');
		const cachedO = await ImmortalDB.get(CACHED_ORIGIN, null);

		// get cached origin from last visit
		origin = cachedO || origin;

		let timer;

		cacheOrigin = () => {
			if (timer) {
				clearTimeout(timer); // cancel any exisitng waiting
			}
			timer = setTimeout(async () => {
				timer = 0;
				// update cache store
				await ImmortalDB.set(CACHED_ORIGIN, origin);
			}, 700);
		};
	});

	$: if (origin && cacheOrigin) cacheOrigin();

	function toggleDisplay() {
		display = !display;

		calcWidth = tweened(null, {
			duration,
			easing
		});
		calcHeight = tweened(null, {
			duration,
			easing
		});

		$calcWidth = display ? initalWidth : 1; // tweening will make this transition instead of jump for us
		$calcHeight = display ? initalHeight : 1;
	}

	let toggleStyle = '';
	$: toggleStyle = display ? ';' : `height: 1px; width: 1px`;

	// experimental, tempermental
	// $: if (display && offsetWidth > 1 && offsetHeight > 1) {
	// 	console.log('Updating initalWidth to ', offsetWidth);
	// 	initalWidth = offsetWidth;
	// 	initalHeight = offsetHeight;
	// }
	// "width: {$calcWidth}px; height: {$calcHeight}px;"
</script>

<Draggable bind:x bind:y>
	<div class="wallet-container" style="--opacity: {opacity}%; top: {y}px; right: {-x}px">
		<div class="mininav">
			Web3 Keychain
			<!-- {offsetWidth} x{offsetHeight} -->
			<Dragger /> <img class="toggle" src={toggle} alt="toggle" on:click={toggleDisplay} />
		</div>
		<div class="bottom-half" style={toggleStyle} bind:offsetWidth bind:offsetHeight>
			{#if origin}
				<small
					>Open <a href={origin} target="_blank" rel="noreferrer">{shortenURL(origin)} ↗️</a></small
				>
			{/if}
			<!-- completely gratuitous transitions -->
			{#if !connected}
				<div
					in:scale={{
						duration,
						delay: duration,
						easing: elasticOut
					}}
					out:slide={{
						duration: duration * 2,
						delay: 100
					}}
				>
					<div class="header">
						<input bind:value={origin} />
					</div>
				</div>
			{/if}
			<!-- iframe slot -->
			<div name="iframe-slot">
				<slot />
			</div>
		</div>
	</div>
</Draggable>

<style>
	a {
		text-decoration: dashed;
		color: rgb(0, 16, 161);
	}
	div {
		display: block;
		overflow: hidden;
	}

	.wallet-container {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		align-content: flex-start;
		align-items: flex-end;
		text-align: right;
		position: fixed;
		background-color: rgb(162 162 162 / var(--opacity));
		border: 1px solid rgb(162 162 162 / var(--opacity));
		padding: 0.5em;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;
		border-radius: 4px;
		z-index: 99 !important;
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
	}
	img.toggle {
		width: 1.75em;
		margin: 0.25em;
		aspect-ratio: auto;
	}
	.mininav {
		display: flex;
		margin: 0.1em;
		align-items: center;
		opacity: 0.85;
	}
</style>
