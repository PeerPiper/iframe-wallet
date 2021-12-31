import { handlers } from './handlers';
import { maybePreprocess } from './handlers/preprocess';
var iframe;
var origin;
export function config(config) {
    iframe = config.iframe;
    origin = config.origin;
}
async function rpc(method, ...params) {
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
    }
    catch (e) {
        console.log(`rpc-run [fail] ${method} ${e}`);
        return { error: { message: `${e}`, code: -32000 }, id };
    }
}
class RemoteRpcProxy {
    constructor(target = handlers, validatorArg = false) {
        const validator = {
            capturedCalls: [],
            get(target, property, receiver) {
                // check to see if property is function or namespace object
                // only accounts for 1 name deep at this time, otherwise: complexity++
                console.log(this.capturedCalls);
                console.log(this.capturedCalls.length);
                console.log(this.capturedCalls[0]?.desc?.value);
                let desc = Object.getOwnPropertyDescriptor(target, property);
                // ||
                // (this.capturedCalls &&
                // 	this.capturedCalls.length > 0 &&
                // 	this.capturedCalls[0] !== null &&
                // 	this.capturedCalls[0]?.desc?.value !== undefined)
                // 	? Object.getOwnPropertyDescriptor(this.capturedCalls[0]?.desc?.value, property)
                // 	: false;
                if (desc?.value && typeof desc?.value === 'function') {
                    let method = property;
                    for (let call of this.capturedCalls) {
                        if (call.type === 'getter') {
                            method = `${call.name}.${property}`; // only accounts for 1 name deep at this time, otherwise: complexity++
                        }
                    }
                    this.capturedCalls = []; // clear cache
                    const regularRPC = async function () {
                        return await rpc(method, ...arguments);
                    };
                    // return regularRPC;
                    return maybePreprocess(regularRPC, rpc, method, ...arguments);
                }
                else {
                    this.capturedCalls.push({ type: 'getter', name: property, desc });
                    return receiver;
                }
            }
        };
        return new Proxy(target, // define this methods by importing from handlers
        validator);
    }
}
export const remote = new RemoteRpcProxy();
