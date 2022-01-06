import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
import Portal from 'iframe-wallet/bundled/es/Portal.min';

export class SvelteComponent extends React.Component {
	constructor() {
		super();

		this.container = React.createRef();
		this.instance = null;
		this.div = React.createElement('div', { ref: this.container });
	}

	componentDidMount() {
		const { this: Constructor, ...data } = this.props;

		this.instance = new Constructor({
			target: this.container.current,
			data
		});
	}

	componentDidUpdate() {
		this.instance.set(this.props);
	}

	componentWillUnmount() {
		this.instance.destroy();
	}

	render() {
		return this.div;
	}
}

let origin = 'http://localhost:3444/';

function App(props) {
	return (
		<div className="App">
			<p>this is a Svelte component inside a React app:</p>
			<SvelteComponent this={Portal} origin={props.origin} />
		</div>
	);
}

ReactDOM.render(
	<React.StrictMode>
		<App this={Portal} origin={origin} />
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
