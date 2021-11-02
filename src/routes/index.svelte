<script>
	import { onMount } from 'svelte';
	import * as CONSTANTS from '$lib/constants';
	import { handlers, setHost } from '$lib/handlers';
	import { page } from '$app/stores';

	setHost($page.host);

	let result;
	let reply;
	let handleMessage;

	onMount(async () => {
		/**
		 * Handle incoming messages to the iFrame
		 */
		handleMessage = async (event) => {
			if (!event.ports[0]) return; // skip if not a port-port message

			reply = (r) => {
				// @ts-ignore
				event.ports[0].postMessage(r);
			};

			let method = event.data?.method;
			let params = event.data?.params;

			if (!(method in handlers)) {
				reply({ status: CONSTANTS.ERROR_METHOD_NOT_FOUND });
				return;
			}

			/**
			 * Passed all criteria, call the RPC function
			 */
			try {
				let fn = handlers[method];
				let args = params ? params : [];
				if (method === 'connect') args = [event.origin]; // connect is the only method that needs the origin passed in? {...args, origin: event.origin}
				result = await fn(...args);
				reply(result);
			} catch (error) {
				let err = new Error(`RPC error calling ${method}(${params.toString()})`);
				console.error(err);
				reply(err);
			}
		};

		// let parent know this iframe is ready to initialize
		window.parent.postMessage(`${CONSTANTS.READY}`, '*'); // window.parent
	});
</script>

<svelte:window on:message={handleMessage} />

<h1>Welcome to iFrame Wallet!</h1>
<p>
	The idea is this wallet is embedded in an iframe in the host's website, so the contexts are
	different and keys are safe. Yet the two can talk via postMessage.
</p>
{result?.status}
