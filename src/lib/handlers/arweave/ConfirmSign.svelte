<script>
	import DefaultConfirmation from '../confirm/DefaultConfirmation.svelte';
	import * as ArweaveUtils from '$lib/handlers/arweave/utils';

	export let props;
	let defConf;
	let checksOut = false;

	const { dataToSign, options, transaction } = props.params;

	let tx = new ArweaveUtils.Transaction(transaction);
	let tags = tx.tags.map((tag) => ({
		name: tag.get('name', { decode: true, string: true }),
		val: tag.get('value', { decode: true, string: true })
	}));
	console.log({ tags });

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
			⚠️ Attention! You are about to sign ({p.method}) this Arweave transaction. Authorize to
			proceed?
		</div>
		<div>
			Tags:<br />
			{#each tags as { name, val }}
				<li class={name.includes('App-Name') ? 'bold' : ''}>
					{name}:
					{val}
				</li>
			{/each}
			Token transfer: {transaction.quantity}<br />
			Gas fees: {transaction.reward} (~${(
				ArweaveUtils.winstonToAr(transaction.reward) * 100
			).toFixed(5)})<br />
		</div>
		<div class="submit">
			<button on:click|preventDefault={defConf.handleConfirm} disabled={!checksOut}>Yes</button>
		</div>
	</div>
</DefaultConfirmation>

<style>
	div.attention {
		display: flex;
		flex-direction: column;
		background-color: #fff9c4;
		filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
	}
	div {
		padding: 0.3em;
		margin: 0.3em;
	}
	button:disabled {
		background-color: grey !important;
	}
	.bold {
		font-weight: bolder;
	}
	li {
		overflow-wrap: break-word;
		word-break: break-all;
	}
</style>
