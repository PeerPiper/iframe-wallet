<script lang="ts">
	import { onMount } from 'svelte';

	import IFrame from './IFrame.svelte';
	import * as CONSTANTS from '../../../iframe-wallet/src/lib/constants';
	import { config, remote } from './remote-rpc';

	// export let encrypt;
	export let origin = 'http://localhost';

	let iFrameLoaded = false;
	let iframe: HTMLIFrameElement;

	let reply;
	let connected = false;
	let mounted;
	let remoteInitialized;
	let pre;
	let data = 'some data here';
	let tag = 'a tag for it';
	let keypair;
	let alice_keypair;
	let bob_keypair;
	let em;
	let reKey;
	let rem;
	let bob_decrypted;

	// Wait for the iframe to load
	const handleLoad = async () => {
		console.log('iFrame loaded');
		config({ iframe, origin });
		iFrameLoaded = true;
	};

	$: iframe && iframe.addEventListener('load', handleLoad);

	onMount(async () => {
		mounted = true;
	});

	const handleInit = async () => {
		// @ts-ignore
		reply = await remote.initialize();
		if (reply?.status == CONSTANTS?.INITIALIZED) remoteInitialized = true;
	};

	const handleConnect = async () => {
		// @ts-ignore
		reply = await remote.connect();
		if (reply.status == CONSTANTS.CONNECTED) connected = true;
	};

	const handleDisconnect = async () => {
		// @ts-ignore
		reply = await remote.disconnect();
		if (reply.status == CONSTANTS.CONNECTED) connected = false;
	};

	const handleGenerateAlice = async () => {
		// @ts-ignore
		alice_keypair = await remote.generate_ed25519_keypair();
	};

	const handleGenerateBob = async () => {
		// @ts-ignore
		bob_keypair = await remote.generate_ed25519_keypair();
	};

	const handleNewProxcryptor = async (name, secretKey) => {
		// @ts-ignore
		pre = await remote.newProxcryptor(name, new Uint8Array(secretKey));
	};

	const handleSelfEncrypt = async (name, data, tag) => {
		// @ts-ignore
		em = await remote.selfEncrypt(name, data, tag);
		console.log({ em });
	};

	const handleGenerateReKey = async (sourcePreName, targetPK, tag) => {
		// @ts-ignore
		reKey = await remote.generateReKey(sourcePreName, targetPK, tag);
		console.log({ reKey });
	};

	const handleReEncrypt = async (targetPK, encrypted_message, re_key) => {
		// @ts-ignore
		rem = await remote.reEncrypt(targetPK, encrypted_message, re_key);
		console.log({ rem });
	};

	const handleReDecrypt = async (pre_name, re_encrypted_message) => {
		// @ts-ignore
		bob_decrypted = await remote.reDecrypt(pre_name, re_encrypted_message);
		console.log({ bob_decrypted });
		let textDecoder = new TextDecoder();

		console.log('In handler', textDecoder.decode(new Uint8Array(bob_decrypted)));
	};
</script>

<p>
	Wallet actions with to <b>{origin}</b> embedded in iFrame:
	<br />
	<button disabled={!iFrameLoaded || remoteInitialized} on:click={handleInit}
		>Initialize Wasm</button
	><br />
	<button disabled={!iFrameLoaded || !remoteInitialized || connected} on:click={handleConnect}
		>Connect</button
	><br />
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
{#if mounted}
	<IFrame bind:iframe src={origin} />
{/if}
<br /><br />{reply?.status ? reply.status : ''}
<br /><br />
Loaded: {iFrameLoaded}<br />
Connected: {connected}<br />
{#if remoteInitialized}
	{#await remoteInitialized}
		Awaiting remoteInitialized...
	{:then remoteInitialized}
		Remote Initialized.{remoteInitialized}
	{/await}
{/if}

<style>
	button {
		margin: 0.25em;
	}
</style>
