# iFrame Wallet

This is a cryptographic wallet itended to be embedded in an iFrame in the parent website (as opposed to the typical way that it's in a browser extension).

## Background

When a wallet is in a browser extension, there are many use restrictions for developers and barriers to entry for new userss:

Developers must

- work around extension globals injected
- itegrate each wallet
- only offer a finite number of wallet options to their users
- more integration work when a new wallet if offered
- there are too many wallet options to consider

Users must

- have a browser that can be extended (no mobile?)
- must want to download & install
- actually download and install
- choose only from app-chosen wallets instead of their own
- work within the chosen wallet capabilities

So since we have barriers to adoption and dev limitations, we can look at another way.

What if the wallet was just a website? Not just any website, but a website that:

- with miminal or zero javascript dependencies (to minimize XSS risk)
- configurable, so user could choose to use their own wallet
- hostable from content verifiable sources, such as IPFS
- hostable from sandboxable sources, such as Deno
- Zero barrier to entry
- Portable to mobile
- extensible by devs and users

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

To add a confirmation to a crypto method handler:

```js
let confirmed = await get(confirm)('<this.method.name.path>', origin);
```

Where `<this.method.name.path>` is something like `'connect'` or `'sign'`.

To add a custom confirmation component:

1. Create the custom component
2. Wrap Custom component in `$lib/handlers/DefaultConfirmation.svelte`
3. Import the Custom Confirm component and inject logic to `src\lib\handlers\confirm\index.ts`

```js
let customizedComponents = {
	connect: { component: Connect }  // existing custom confirm component
	<namespce>: {
		<methodName>: {
			component: <CustomComponentName>
		}
	}
};
```

## Contributing

Don't add any JavaScript dependencies, we're trying to minimize any chance of attacks. Otherwise Issues and PRs accepted.

## License

MIT with Commons Clause © DougAnderson444
