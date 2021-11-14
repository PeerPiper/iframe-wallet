<script>
	import DefaultConfirmation from '../confirm/DefaultConfirmation.svelte';
	import * as ArweaveUtils from '$lib/handlers/arweave/utils';

	export let props;
	let defConf;
	let checksOut = false;

	const { dataToSign, options, transaction } = props.params;

	$: props && dataToSign && transaction && checkTx();

	// Check dataToSign to ensure it matches what the app passed in
	async function checkTx() {
		// assert that it matches
		let signThisData = await ArweaveUtils.getSignatureData(transaction);
		signThisData = new Uint8Array(signThisData);
		if (JSON.stringify(props.params.dataToSign) === JSON.stringify(signThisData)) checksOut = true;
		return checksOut;
	}
</script>

<!-- 
{props} passes the properties down to <DefaultConfirmation>
let:props={p} gets them back up from the <DefaultConfirmation> slot 
-->
<DefaultConfirmation bind:this={defConf} {props} let:props={p} on:confirmed>
	<div class="attention">
		<!-- this is default content, override with slot -->
		<div>
			⚠️ Attention! You are about to sign ({p.method}) this Arweave transaction. Do you authorize
			this?
		</div>
		<div>
			Details:<br />
			Token transfer: {transaction.quantity}<br />
			Gas fees: {transaction.reward}<br />
		</div>
		<p>{!checksOut ? 'Checking data...' : 'Checks Out'}</p>
		<div class="submit">
			<button on:click|preventDefault={defConf.handleConfirm} disabled={!checksOut}>Yes</button>
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
	button:disabled {
		background-color: grey !important;
	}
</style>
