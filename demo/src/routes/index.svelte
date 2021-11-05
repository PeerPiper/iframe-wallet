<script>
	import { onMount } from 'svelte';
	import Portal from '../../../../iframe-wallet/src/lib/Portal.svelte';
	import svg from '../../../../iframe-wallet/src/lib/graphics/mini-svg-bookmark.svg';

	// Need these for Portal Component
	let portal;
	let portalLoaded = false;
	let origin = 'http://localhost:3444'; // optional to change default

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

	const handleConnect = async () => {
		// @ts-ignore
		reply = await portal.connect();
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
		console.log({ em });
	};

	const handleSelfDecrypt = async (name, data, tag) => {
		// @ts-ignore
		dm = await portal.selfDecrypt(data, name);
		console.log({ dm });
	};

	const handleGenerateReKey = async (sourcePreName, targetPK, tag) => {
		// @ts-ignore
		reKey = await portal.generateReKey(sourcePreName, targetPK, tag);
		console.log({ reKey });
	};

	const handleReEncrypt = async (targetPK, encrypted_message, re_key) => {
		// @ts-ignore
		rem = await portal.reEncrypt(targetPK, encrypted_message, re_key);
		console.log({ rem });
	};

	const handleReDecrypt = async (pre_name, re_encrypted_message) => {
		// @ts-ignore
		bob_decrypted = await portal.reDecrypt(pre_name, re_encrypted_message);
		console.log({ bob_decrypted });
	};
</script>

<img src={svg} alt="SolBlog" class="tab" />

<h1>iFrame Wallet Portal Demo</h1>

<p>
	Wallet actions with to <b>{origin}</b> embedded in iFrame:
	<br />
	<button disabled={!portalLoaded || connected} on:click={handleConnect}>Connect</button><br />
	<button disabled={!connected} on:click={handleDisconnect}>Disconnect</button><br />
	<button disabled={!connected || alice_keypair} on:click={handleGenerateAlice}
		>Generate Alice Keypair</button
	><br />
	<button disabled={!connected || bob_keypair} on:click={handleGenerateBob}
		>Generate Bob Keypair</button
	><br />
	<button
		disabled={!connected || !(alice_keypair && bob_keypair)}
		on:click={() => handleNewProxcryptor('alice', alice_keypair.secretKey)}
		>Create Alice Proxcryptor</button
	><br />
	<button
		disabled={!connected || !(alice_keypair && bob_keypair)}
		on:click={() => handleNewProxcryptor('bob', bob_keypair.secretKey)}
		>Create Bob Proxcryptor</button
	><br />
	<button disabled={!pre} on:click={() => handleSelfEncrypt('alice', data, tag)}>SelfEncrypt</button
	><br />
	<button disabled={!pre} on:click={() => handleSelfDecrypt('alice', data, tag)}>SelfDecrypt</button
	><br />
	<button
		disabled={!connected || !bob_keypair}
		on:click={() => handleGenerateReKey('alice', bob_keypair.publicKey, tag)}
		>GenerateReKey for Alice or Proxy
	</button><br />
	<button
		disabled={!connected || !bob_keypair}
		on:click={() => handleReEncrypt(bob_keypair.publicKey, em, reKey)}>ReEncrypt for Bob</button
	><br />
	<button disabled={!connected || !bob_keypair} on:click={() => handleReDecrypt('bob', rem)}
		>Bob Decrypt</button
	>
</p>
<Portal {origin} bind:portal bind:portalLoaded />

<br /><br />{reply?.status ? reply.status : ''}
<br /><br />
Loaded: {portalLoaded}<br />
Connected: {connected}<br />

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
