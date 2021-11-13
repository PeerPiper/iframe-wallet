<script lang="ts">
	// show the user's keys
	// parse out the JWKs into types: RSA and Ed25519 according to JWK
	export let keys;
	let selectedRSA;
	let collapsed;

	let shorten = (key: string) => {
		return key.slice(0, 3) + '...' + key.slice(key.length - 5, key.length - 1);
	};
</script>

{#if keys && keys.length > 0}
	<h3>Key List:</h3>
	<div class="keylist">
		<div class="row left">
			<span>RSA:</span>
		</div>
		<div class="row">
			<ul>
				{#each keys.filter((k) => k.kty == 'RSA') as rsaJWK}
					<li class={collapsed && selectedRSA != rsaJWK.kid ? 'hide' : ''}>{rsaJWK.kid}</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="keylist">
		<div class="row left">
			<span>Ed25519</span>
		</div>
		<div class="row">
			<ul>
				{#each keys.filter((k) => k.crv == 'Ed25519') as edJWK}
					<li>{edJWK.x}</li>
					<!-- <b>{shorten(key?.publicKeyBase58)}</b><br /> -->
				{/each}
			</ul>
		</div>
	</div>
{/if}

<style>
	.keylist {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: flex-start;
		align-items: stretch;
		align-content: stretch;
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
	}
</style>
