<script>
	import { onMount } from 'svelte';
	import Portal from '../../../../iframe-wallet/src/lib/Portal.svelte';
</script>

<h1>iFrame Wallet Demo</h1>

<Portal origin={'http://localhost:3444'} />
