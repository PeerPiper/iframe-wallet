import logo from './logo.svg';
import './App.css';

import Portal from 'iframe-wallet/bundled/es/Portal.min';
import { SvelteComponent } from './';

console.log({ Portal });

let tempPortal;
let origin = 'http://localhost:3444/';
const portal = new Portal({
	target: document.body, //
	props: {
		origin,
		portal: tempPortal
	}
});

portal.$on('connected', (event) => {
	console.log('portal connected', event.detail.selection, { tempPortal });
});
console.log({ portal });

function App(props) {
	return (
		<div className="App" id="web3-wallet-portal">
			<p>this is a Svelte component inside a React app:</p>
			<SvelteComponent this={Portal} origin={origin} />
		</div>
	);
}

export default App;
