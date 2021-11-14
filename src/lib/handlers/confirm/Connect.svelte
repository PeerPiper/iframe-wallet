<script>
	import DefaultConfirmation from './DefaultConfirmation.svelte';

	export let props;

	let defConf;
</script>

<DefaultConfirmation bind:this={defConf} {props} let:props={p} on:confirmed>
	<div class="attention">
		<!-- this is default content, override with slot -->
		<div>
			⚠️ Attention! You are about to connect ({p.method}) this site to your wallet. Do you authorize
			this?
		</div>
		<div class="submit">
			<button on:click|preventDefault={defConf.handleConfirm}>Yes</button>
		</div>
	</div>
</DefaultConfirmation>

<style>
	div.attention {
		display: flex;
		flex-direction: column;
		background-color: lightyellow;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.1));
	}
	div {
		padding: 0.3em;
		margin: 0.3em;
	}
</style>
