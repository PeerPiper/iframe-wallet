<script>
	export let iframe;
	export let origin; // iframe src
</script>

<div class="iframe-container">
	<div class="iframe-inner">
		<iframe title="Web Wallet" bind:this={iframe} src={origin} />
	</div>
</div>

<style>
	.iframe-container {
		position: relative;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
	.iframe-inner {
		flex: 1;
		height: 100%;
	}
	iframe {
		height: 100%;
		width: 100%;
		border: 0;
	}
</style>
