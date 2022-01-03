<svelte:options tag={'web3-wallet-iframe'} />

<script>
	import { tweened } from 'svelte/motion';
	import { elasticOut, quintOut } from 'svelte/easing';

	export let iframe;
	export let origin; // iframe src

	export let offsetWidth;
	export let offsetHeight;

	let duration = 400;
	let easing = quintOut;

	// interpolate the dimensions
	const calcWidth = tweened(null, {
		duration,
		easing
	});

	// interpolate the dimensions
	const calcHeight = tweened(null, {
		duration,
		easing
	});

	$: if (offsetHeight || offsetWidth) updateDimensions();

	function updateDimensions() {
		$calcWidth = offsetWidth; // tweening will make this transition instead of jump for us
		$calcHeight = offsetHeight;
	}
</script>

<!-- debug info -->
<!-- iframe: {offsetWidth} x {offsetHeight}<br /> -->
<!-- iframeCalc: {$calcWidth} x {$calcHeight}<br /> -->
<iframe
	title="Web Wallet"
	bind:this={iframe}
	src={origin}
	style="width: {$calcWidth}px; height: {$calcHeight}px;"
	scrolling="no"
/>

<style>
	iframe {
		flex: 1;
		border: 0;
		/* min-height: 100px; */
		/* min-width: 200px; */
	}
</style>
