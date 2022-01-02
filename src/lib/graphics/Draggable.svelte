<svelte:options tag={null} />

<script>
	import { pannable } from './pannable.js';
	import { spring } from 'svelte/motion';

	export let x;
	export let y;

	$: x = $coords.x;
	$: y = $coords.y;

	const coords = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.2,
			damping: 0.4
		}
	);

	function handlePanMove(event) {
		coords.update(($coords) => ({
			x: $coords.x + event.detail.dx,
			y: $coords.y + event.detail.dy
		}));
	}
	function handlePanEnd(event) {
		// TODO: save position?
	}
</script>

<div use:pannable on:panmove={handlePanMove} on:panend={handlePanEnd}>
	<slot />
</div>

<style>
	div {
		position: fixed;
		z-index: 99 !important;
	}
</style>
