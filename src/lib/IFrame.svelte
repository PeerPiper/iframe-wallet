<script>
	export let iframe;
	export let src;
	// export let serializedSource;
</script>

<div class="iframe-container">
	<div class="header">
		<!-- {#if serializedSource}
			Preview:
		{:else}
			Compiling...
		{/if} -->
	</div>
	<div class="iframe-inner">
		<iframe title="Web Wallet" bind:this={iframe} {src} />
	</div>
</div>

<style>
	.header {
		margin: 0.1em;
		padding: 0.1em;
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		color: rgba(0, 0, 0, 0.7);
	}
	iframe {
		height: 100%;
		width: 100%;
		border: 0;
	}
	.iframe-container {
		display: flex;
		flex-direction: column;
		border: 1px solid #a2a2a252;
		padding: 1px;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;
		border-radius: 4px;
	}
	.iframe-inner {
		flex: 1;
		height: 100%;
	}
</style>
