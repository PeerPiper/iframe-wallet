<script>
	import { onMount } from 'svelte';
	// import Portal from '../../../../iframe-wallet/src/lib/Portal.svelte';
	import svg from '../../../../iframe-wallet/src/lib/graphics/mini-svg-bookmark.svg';
	// import Portal from 'iframe-wallet/dist/Portal.svelte'; // from package manager

	let Portal;
	let mounted;
	let el;

	onMount(async () => {
		const portal = await import('../../../../iframe-wallet/dist/Portal.svelte'); // from file system
		console.log({ portal });
		Portal = portal.default;
		mounted = true;

		// @ts-ignore
	});

	$: if (el) portal = el.portal;
	$: if (el?.portal) console.log('The portal accessor variable is', { portal });

	// Need these for Portal Component
	let portal;
	let origin = 'http://localhost:3444/'; // optional to change default

	let connected = false;
	let reply;
	let pre;
	let alice_keypair;
	let bob_keypair;
	let em;
	let dm;
	let reKey;
	let rem;
	let bob_decrypted;

	let data = 'some data here';
	let tag = 'a tag for it';
	let signature, match;

	$: portal && console.log({ portal });

	const handleConnect = async () => {
		// @ts-ignore
		reply = await portal.connectWallet();
		if (reply.status == portal.CONSTANTS.CONNECTED) connected = true;
	};

	const handleDisconnect = async () => {
		// @ts-ignore
		reply = await portal.disconnect();
		if (reply.status == portal.CONSTANTS.CONNECTED) connected = false;
	};

	const handleGenerateAlice = async () => {
		// @ts-ignore
		alice_keypair = await portal.generateEd25519Keypair();
	};

	const handleGenerateBob = async () => {
		// @ts-ignore
		bob_keypair = await portal.generateEd25519Keypair();
	};

	const handleNewProxcryptor = async (name, secretKey) => {
		// @ts-ignore
		pre = await portal.newProxcryptor(new Uint8Array(secretKey), name);
	};

	const handleSelfEncrypt = async (name, data, tag) => {
		// @ts-ignore
		em = await portal.selfEncrypt(data, tag, name);
	};

	const handleSelfDecrypt = async (name, data, tag) => {
		// @ts-ignore
		dm = await portal.selfDecrypt(data, name);
	};

	const handleGenerateReKey = async (sourcePreName, targetPK, tag) => {
		// @ts-ignore
		reKey = await portal.generateReKey(sourcePreName, targetPK, tag);
	};

	const handleReEncrypt = async (targetPK, encrypted_message, re_key) => {
		// @ts-ignore
		rem = await portal.reEncrypt(targetPK, encrypted_message, re_key);
	};

	const handleReDecrypt = async (pre_name, re_encrypted_message) => {
		// @ts-ignore
		bob_decrypted = await portal.reDecrypt(pre_name, re_encrypted_message);
	};
	async function handleSign(ev) {
		const encoder = new TextEncoder();
		const encoded = encoder.encode(data);
		signature = await portal.ed25519.sign(encoded);
		console.log({ signature });
	}

	async function handleVerify(ev) {
		const encoder = new TextEncoder();
		const encoded = encoder.encode(data);
		const public_key = await portal.getPublicKey();
		match = await portal.ed25519.verify(public_key, encoded, signature);
		console.log({ match });
	}
</script>

<svelte:head />

<div id="walletportal" />

<!-- <img src={svg} alt="bookmark" class="tab" /> -->

<h1>iFrame Wallet Portal Demo</h1>

<p>
	Wallet actions with to <b>{origin}</b> embedded in iFrame:
	<br />
	<!-- <button disabled={!portal || connected} on:click={handleConnect}>Connect</button><br /> -->
	<!-- <button disabled={!portal} on:click={handleDisconnect}>Disconnect</button><br /> -->
	<!-- <button disabled={!portal || alice_keypair} on:click={handleGenerateAlice}
		>Generate Alice Keypair</button
	><br />
	<button disabled={!portal || bob_keypair} on:click={handleGenerateBob}
		>Generate Bob Keypair</button
	><br />
	<button
		disabled={!portal || !(alice_keypair && bob_keypair)}
		on:click={() => handleNewProxcryptor('alice', alice_keypair.secretKey)}
		>Create Alice Proxcryptor</button
	><br />
	<button
		disabled={!portal || !(alice_keypair && bob_keypair)}
		on:click={() => handleNewProxcryptor('bob', bob_keypair.secretKey)}
		>Create Bob Proxcryptor</button
	><br />
	<button disabled={!pre} on:click={() => handleSelfEncrypt('alice', data, tag)}>SelfEncrypt</button
	><br />
	<button disabled={!pre} on:click={() => handleSelfDecrypt('alice', data, tag)}>SelfDecrypt</button
	><br />
	<button
		disabled={!portal || !bob_keypair}
		on:click={() => handleGenerateReKey('alice', bob_keypair.publicKey, tag)}
		>GenerateReKey for Alice or Proxy
	</button><br />
	<button
		disabled={!portal || !bob_keypair}
		on:click={() => handleReEncrypt(bob_keypair.publicKey, em, reKey)}>ReEncrypt for Bob</button
	><br />
	<button disabled={!portal || !bob_keypair} on:click={() => handleReDecrypt('bob', rem)}
		>Bob Decrypt</button
	> -->
	<button on:click={handleSign}>Sign this</button>
	<button on:click={handleVerify} disabled={!signature}>Verify this</button>
</p>

{#if mounted}
	<Portal {origin} bind:portal />
{/if}
<br /><br />{reply?.status ? reply.status : ''}
<br /><br />
Connected: {!!portal}<br />

<style>
	button {
		margin: 0.25em;
	}
	.tab {
		position: fixed;
		top: -1px;
		right: 2%;
		display: flex;
		flex-direction: column;
		padding: 1px;
		-webkit-border-radius: 4px;
		-moz-border-radius: 4px;
		border-radius: 4px;
		z-index: 99 !important;
	}
</style>
