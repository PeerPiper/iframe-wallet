<svelte:options tag={null} />

<script>
	// show the user's keys
	// parse out the JWKs into types: RSA and Ed25519 according to JWK
	import { shorten } from './index';

	export let keys;
	let selectedRSA;
	let collapsed;
</script>

{#if keys && keys.length > 0}
	<div class="card">
		<div class="keylist">
			<div class="row left">
				<span>Arweave</span>
			</div>
			<div class="row list-group">
				<ul>
					{#each keys.filter((k) => k.kty == 'RSA') as rsaJWK}
						<li
							class="{collapsed && selectedRSA != rsaJWK.kid
								? 'hide'
								: ''} list-group-item list-group-item-action "
						>
							{shorten(rsaJWK.kid)}
						</li>
					{/each}
				</ul>
			</div>
		</div>
		<div class="keylist">
			<div class="row left">
				<span>Ed25519</span>
			</div>
			<div class="row list-group">
				<ul>
					{#each keys.filter((k) => k.crv == 'Ed25519') as edJWK}
						<li class=" list-group-item list-group-item-action ">{shorten(edJWK.x)}</li>
						<!-- <b>{shorten(key?.publicKeyBase58)}</b><br /> -->
					{/each}
				</ul>
			</div>
		</div>
	</div>
{/if}

<style>
	.card {
		margin: 1em 0em;
		background-color: rgb(35, 35, 35);
		padding: 1.5em;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;
		border-radius: 4px;
		box-shadow: 2px 2px 6px rgba(14, 255, 2, 0.7);
		color: #0eff02;
	}
	.keylist {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: stretch;
		align-content: stretch;
		border-width: 2px;
		border-bottom: 1px #d6e7df solid;
		padding-bottom: 4px;
		margin-bottom: 4px;
	}
	.left {
		flex-shrink: 2;
		width: 85px;
	}
	.row,
	ul {
		margin: 0em;
		padding: 0em;
	}
	.row:not(.left) {
		flex: 1 1 auto;
		overflow-y: auto;
	}
	.hide {
		display: none;
	}
	li {
		list-style: none;
		font-family: var(--font-mono);
	}
</style>
