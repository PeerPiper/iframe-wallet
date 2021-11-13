<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let props;

	export function handleConfirm() {
		let value = true;
		dispatch('confirmed', { value });
		console.log('handled confirm');
	}
</script>

<div>
	<!-- *also* pass handleConfirm up to slot parent, so they can trigger it with their custom button -->
	<slot {handleConfirm} {props}>
		<div class="attention">
			<!-- this is default content, override with slot -->
			<div>
				⚠️ Authorize {props} from your wallet?
			</div>
			<div class="submit">
				<button on:click={handleConfirm}>Yes</button>
			</div>
		</div>
	</slot>
</div>

<style>
	div.attention {
		display: flex;
		flex-direction: column;
		background-color: lightyellow;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	}
	div {
		padding: 0.5em;
		margin: 0.5em;
		width: fit-content;
	}
</style>
