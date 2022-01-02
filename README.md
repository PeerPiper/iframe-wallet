# iFrame Wallet

This wallet is not a browser extension.

Work in progress. Not yet ready for production. Feel free to contribute.

This is an experimental new type of cryptographic wallet intended to be embedded in an iFrame in the parent website (as opposed to the typical way that it's in a browser extension).

## Background

Read the [blog post](https://medium.com/peerpiper/peerpiper-introducing-a-next-gen-web3-keychain-storage-scheme-a06507725a5d).

When a wallet is in a browser extension, there are many use restrictions for developers and barriers to entry for new userss:

Developers must

- work around extension globals injected
- itegrate each wallet
- only offer a list of preselected wallet options to their users
- more integration work when a new wallet if offered

To adopt the current wallet model, users must:

- have a browser that can be extended (no mobile?)
- must _want_ to download & install (ugh, I have to install something? Really?)
- _actually_ download and install
- choose only from app-chosen wallets, instead of their own
- work within the chosen wallet capabilities (many wallets don't offer encryption or key type options)

So since we have barriers to adoption and dev limitations, we can look at another way.

What if the wallet was just a website? Not just any website, but a website:

- with miminal or zero javascript dependencies (to minimize XSS risk)
- configurable, so user could choose to use their own wallet
- hostable from content verifiable sources, such as IPFS (content identifiable)
- hostable from sandboxable sources, such as Deno
- Zero barrier to entry (no download)
- Portable to mobile
- extensible by devs and users (add your own CSS, confirmation components, anything)

Then perhaps we could have greater adoption and get this Web3 thing really rolling?

## Install

```
npm install @douganderson444/iframe-wallet
```

## Usage

```
npm run dev
```

## Dev Notes

### Use in Svelte Apps

For non-Svelte App use, see Custom Elements note below.

For Svelte apps, import the Portal Component and instantiate it in your app

```js
<script>
	import Portal from 'iframe-wallet'

	let portal

	function handleSign(){
		portal.ed25519.sign(data)
	}
</script>

<Portal origin={'https://iframe-wallet.pages.dev'} bind:portal />



```

### Building Portal Component

This package uses [Custom Elements](https://svelte.dev/docs#run-time-custom-element-api) for the Portal build.

At this time, SvelteKit doesn't support this, so we use Rollup to build the Portal.svelte component into `<web3-wallet-portal></web3-wallet-portal>` custom element that can be used by HTML websites or any other framework, such as React, Vue, etc.

Read more about custom elements [here](https://custom-elements-everywhere.com/).

This build is done by npm run `build:components` which runs Rollups and outputs the build and bundled components as Javascript classes in `build/components`

These custom elements can then be imported by other website using

```html
<head>
	<!-- UMD -->
	<script src="https://iframe-wallet.pages.dev/components/umd/Portal.min.js
"></script>

	<!-- IIFE -->
	<!-- <script defer src='https://iframe-wallet.pages.dev/components/iife/Portal.min.js
'></script> -->

	<!-- ES -->
	<!-- <script type="module" src='https://iframe-wallet.pages.dev/components/es/Portal.min.js
'></script> -->
</head>

<body>
	<web3-wallet-portal></web3-wallet-portal>
	<web3-wallet-portal origin="https://iframe-wallet.pages.dev/"></web3-wallet-portal>
</body>
```

When this package is deployed to a website (reference deployment: `https://iframe-wallet.pages.dev/`) then the Wallet Portal can be accessed from this deployment via:

https://iframe-wallet.pages.dev/components/es/Portal.min.js
https://iframe-wallet.pages.dev/components/iife/Portal.min.js
https://iframe-wallet.pages.dev/components/umd/Portal.min.js

### Custom confirmation components

To add a (Svelte) confirmation Components to a crypto method handler:

```js
let confirmed = await get(confirm)('<method.name.path>', origin);
```

Where `<method.name.path>` is something like `'connect'` or `'sign'` or `'arweaveWalletAPI.sign'`.

To add a custom confirmation component:

1. Create the custom component
2. Wrap Custom component in `$lib/handlers/DefaultConfirmation.svelte`
3. Import the Custom Confirm component and inject logic to `src\lib\handlers\confirm\index.ts`

```js
let customizedComponents = {
	connect: { component: Connect }  // existing custom confirm component
	<namespace>: {
		<methodName>: {
			component: <CustomComponentName>
		}
	}
};
```

## Contributing

Don't add any JavaScript dependencies unless you absolutely have to, we're trying to minimize any chance of attacks. Rust+ Wasm would be preferred. Otherwise Issues and PRs accepted.

## License

MIT with Commons Clause © DougAnderson444
