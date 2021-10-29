var iframe;
var origin;

export function config(config) {
	iframe = config.iframe;
	origin = config.origin;
}

async function rpc(method, ...params) {
	console.log(`rpc-run ${method}(${params})`);
	try {
		const channel = new MessageChannel();
		return new Promise((resolve, reject) => {
			// Listen for messages on port1
			channel.port1.onmessage = (e) => {
				channel.port1.close();
				resolve(e.data);
			};
			// Transfer port2 to the iframe
			iframe.contentWindow.postMessage({ method, params }, origin, [channel.port2]);
		});
	} catch (e) {
		console.log(`rpc-run [fail] ${method} ${e}`);
		return { error: { message: `${e}`, code: -32000 }, id };
	}
}

class RemoteRpcProxy {
	constructor() {
		return new Proxy(this, {
			get(target, prop) {
				return async function () {
					return await rpc(prop, ...arguments);
				};
			}
		});
	}
}

export const remote = new RemoteRpcProxy();
