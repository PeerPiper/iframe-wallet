<script lang="ts">
	import { onMount } from 'svelte';

	import IFrame from './IFrame.svelte';
	import * as CONSTANTS from '../../../iframe-wallet/src/lib/constants';
	import { config, remote } from './remote-rpc';

	// export let encrypt;
	export let origin = 'http://localhost'; // https://wallet.peerpiper.io/ ?

	export let portalLoaded = false;
	let iframe: HTMLIFrameElement;

	let mounted;
	let initialize;

	// Wait for the iframe to load
	export const handleLoad = async () => {
		config({ iframe, origin });
		portalLoaded = true;
	};

	$: iframe && iframe.addEventListener('load', handleLoad);

	onMount(async () => {
		mounted = true; // Parent needs to mount first, to ensure the iframe listener is added
	});

	// This ($:) updates portal once onMount is called, which updates { initialize: initialize() }
	export const portal = {
		CONSTANTS, // re-export for convenience
		/*
		 * Must not init in SSR with Vite
		 */
		initialize: async () => {
			// @ts-ignore
			let reply = await remote.initialize();
			return reply;
		},
		connect: async () => {
			// @ts-ignore
			let reply = await remote.connect();
			return reply;
		},

		disconnect: async () => {
			// @ts-ignore
			let reply = await remote.disconnect();
			return reply;
		},

		generateEd25519Keypair: async () => {
			// @ts-ignore
			const keypair = await remote.generate_ed25519_keypair();
			return keypair;
		},

		newProxcryptor: async (name, secretKey) => {
			// @ts-ignore
			const pre = await remote.newProxcryptor(name, new Uint8Array(secretKey));
			return pre;
		},

		selfEncrypt: async (name, data, tag) => {
			// @ts-ignore
			const em = await remote.selfEncrypt(name, data, tag);
			return em;
		},

		generateReKey: async (sourcePreName, targetPK, tag) => {
			// @ts-ignore
			const reKey = await remote.generateReKey(sourcePreName, targetPK, tag);
			return reKey;
		},

		reEncrypt: async (targetPK, encrypted_message, re_key) => {
			// @ts-ignore
			const rem = await remote.reEncrypt(targetPK, encrypted_message, re_key);
			return rem;
		},

		reDecrypt: async (pre_name, re_encrypted_message) => {
			// @ts-ignore
			const decrypted = await remote.reDecrypt(pre_name, re_encrypted_message);
			let textDecoder = new TextDecoder();
			return textDecoder.decode(new Uint8Array(decrypted));
		}
	};
</script>

{#if mounted}
	<IFrame bind:iframe src={origin} />
{/if}
