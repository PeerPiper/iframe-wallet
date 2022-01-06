// import * as B64 from 'base64-js';
import { encode as fromByteArray, decode as toByteArray } from '@stablelib/base64';
import deepHash from './deepHash';
// import * as BigNumber from 'bignumber.js';
import BigNumber from 'bignumber.js';
export function concatBuffers(buffers) {
    let total_length = 0;
    for (let i = 0; i < buffers.length; i++) {
        total_length += buffers[i].byteLength;
    }
    let temp = new Uint8Array(total_length);
    let offset = 0;
    temp.set(new Uint8Array(buffers[0]), offset);
    offset += buffers[0].byteLength;
    for (let i = 1; i < buffers.length; i++) {
        temp.set(new Uint8Array(buffers[i]), offset);
        offset += buffers[i].byteLength;
    }
    return temp;
}
export function b64UrlToString(b64UrlString) {
    let buffer = b64UrlToBuffer(b64UrlString);
    // TextEncoder will be available in browsers, but not in node
    if (typeof TextDecoder == 'undefined') {
        const TextDecoder = require('util').TextDecoder;
        return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
}
export function bufferToString(buffer) {
    // TextEncoder will be available in browsers, but not in node
    if (typeof TextDecoder == 'undefined') {
        const TextDecoder = require('util').TextDecoder;
        return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    }
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
}
export function stringToBuffer(string) {
    // TextEncoder will be available in browsers, but not in node
    if (typeof TextEncoder == 'undefined') {
        const TextEncoder = require('util').TextEncoder;
        return new TextEncoder().encode(string);
    }
    return new TextEncoder().encode(string);
}
export function stringToB64Url(string) {
    return bufferTob64Url(stringToBuffer(string));
}
export function b64UrlToBuffer(b64UrlString) {
    return new Uint8Array(toByteArray(b64UrlDecode(b64UrlString)));
}
export function bufferTob64(buffer) {
    return fromByteArray(new Uint8Array(buffer));
}
export function bufferTob64Url(buffer) {
    return b64UrlEncode(bufferTob64(buffer));
}
export function b64UrlEncode(b64UrlString) {
    return b64UrlString.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}
export function b64UrlDecode(b64UrlString) {
    b64UrlString = b64UrlString.replace(/\-/g, '+').replace(/\_/g, '/');
    let padding;
    b64UrlString.length % 4 == 0 ? (padding = 0) : (padding = 4 - (b64UrlString.length % 4));
    return b64UrlString.concat('='.repeat(padding));
}
export async function getSignatureData(tx) {
    // Structured clone transfer strips all the fancy Function helpers
    // reconstruct Transaction Object to get them back
    tx = new Transaction(tx);
    switch (tx.format) {
        case 1:
            let tags = tx.tags.reduce((accumulator, tag) => {
                return concatBuffers([
                    accumulator,
                    tag.get('name', { decode: true, string: false }),
                    tag.get('value', { decode: true, string: false })
                ]);
            }, new Uint8Array());
            return concatBuffers([
                tx.get('owner', { decode: true, string: false }),
                tx.get('target', { decode: true, string: false }),
                tx.get('data', { decode: true, string: false }),
                stringToBuffer(tx.quantity),
                stringToBuffer(tx.reward),
                tx.get('last_tx', { decode: true, string: false }),
                tags
            ]);
        case 2:
            if (!tx.data_root) {
                await tx.prepareChunks(tx.data);
            }
            const tagList = tx.tags.map((tag) => [
                tag.get('name', { decode: true, string: false }),
                tag.get('value', { decode: true, string: false })
            ]);
            return await deepHash([
                stringToBuffer(tx.format.toString()),
                tx.get('owner', { decode: true, string: false }),
                tx.get('target', { decode: true, string: false }),
                stringToBuffer(tx.quantity),
                stringToBuffer(tx.reward),
                tx.get('last_tx', { decode: true, string: false }),
                tagList,
                stringToBuffer(tx.data_size),
                tx.get('data_root', { decode: true, string: false })
            ]);
        default:
            throw new Error(`Unexpected transaction format: ${tx.format}`);
    }
}
export function setSignature(tx, { id, owner, reward, tags, signature }) {
    tx.id = id;
    tx.owner = owner;
    if (reward)
        tx.reward = reward;
    if (tags)
        tx.tags = tags;
    tx.signature = signature;
    return tx;
}
// from Arweave TX
// https://github.com/ArweaveTeam/arweave-js/blob/8df379bfd2744fa3525fca8dee1f9d74f352bec6/src/common/lib/transaction.ts#L53
class BaseObject {
    get(field, options) {
        if (!Object.getOwnPropertyNames(this).includes(field)) {
            throw new Error(`Field "${field}" is not a property of the Arweave Transaction class.`);
        }
        // Handle fields that are Uint8Arrays.
        // To maintain compat we encode them to b64url
        // if decode option is not specificed.
        if (this[field] instanceof Uint8Array) {
            if (options && options.decode && options.string) {
                return bufferToString(this[field]);
            }
            if (options && options.decode && !options.string) {
                return this[field];
            }
            return bufferTob64Url(this[field]);
        }
        if (options && options.decode == true) {
            if (options && options.string) {
                return b64UrlToString(this[field]);
            }
            return b64UrlToBuffer(this[field]);
        }
        return this[field];
    }
}
export class Tag extends BaseObject {
    constructor(name, value, decode = false) {
        super();
        this.name = name;
        this.value = value;
    }
}
export default {};
export class Transaction extends BaseObject {
    constructor(attributes = {}) {
        super();
        this.format = 2;
        this.id = '';
        this.last_tx = '';
        this.owner = '';
        this.tags = [];
        this.target = '';
        this.quantity = '0';
        this.data_size = '0';
        this.data = new Uint8Array();
        this.data_root = '';
        this.reward = '0';
        this.signature = '';
        Object.assign(this, attributes);
        // If something passes in a Tx that has been toJSON'ed and back,
        // or where the data was filled in from /tx/data endpoint.
        // data will be b64url encoded, so decode it.
        if (typeof this.data === 'string') {
            this.data = ArweaveUtils.b64UrlToBuffer(this.data);
        }
        if (attributes.tags) {
            this.tags = attributes.tags.map((tag) => {
                return new Tag(tag.name, tag.value);
            });
        }
    }
    addTag(name, value) {
        this.tags.push(new Tag(ArweaveUtils.stringToB64Url(name), ArweaveUtils.stringToB64Url(value)));
    }
    toJSON() {
        return {
            format: this.format,
            id: this.id,
            last_tx: this.last_tx,
            owner: this.owner,
            tags: this.tags,
            target: this.target,
            quantity: this.quantity,
            data: ArweaveUtils.bufferTob64Url(this.data),
            data_size: this.data_size,
            data_root: this.data_root,
            data_tree: this.data_tree,
            reward: this.reward,
            signature: this.signature
        };
    }
    setOwner(owner) {
        this.owner = owner;
    }
    setSignature({ id, owner, reward, tags, signature }) {
        this.id = id;
        this.owner = owner;
        if (reward)
            this.reward = reward;
        if (tags)
            this.tags = tags;
        this.signature = signature;
    }
    async prepareChunks(data) {
        // Note: we *do not* use `this.data`, the caller may be
        // operating on a transaction with an zero length data field.
        // This function computes the chunks for the data passed in and
        // assigns the result to this transaction. It should not read the
        // data *from* this transaction.
        if (!this.chunks && data.byteLength > 0) {
            this.chunks = await generateTransactionChunks(data);
            this.data_root = ArweaveUtils.bufferTob64Url(this.chunks.data_root);
        }
        if (!this.chunks && data.byteLength === 0) {
            this.chunks = {
                chunks: [],
                data_root: new Uint8Array(),
                proofs: []
            };
            this.data_root = '';
        }
    }
    // Returns a chunk in a format suitable for posting to /chunk.
    // Similar to `prepareChunks()` this does not operate `this.data`,
    // instead using the data passed in.
    getChunk(idx, data) {
        if (!this.chunks) {
            throw new Error(`Chunks have not been prepared`);
        }
        const proof = this.chunks.proofs[idx];
        const chunk = this.chunks.chunks[idx];
        return {
            data_root: this.data_root,
            data_size: this.data_size,
            data_path: ArweaveUtils.bufferTob64Url(proof.proof),
            offset: proof.offset.toString(),
            chunk: ArweaveUtils.bufferTob64Url(data.slice(chunk.minByteRange, chunk.maxByteRange))
        };
    }
    async getSignatureData() {
        switch (this.format) {
            case 1:
                let tags = this.tags.reduce((accumulator, tag) => {
                    return ArweaveUtils.concatBuffers([
                        accumulator,
                        tag.get('name', { decode: true, string: false }),
                        tag.get('value', { decode: true, string: false })
                    ]);
                }, new Uint8Array());
                return ArweaveUtils.concatBuffers([
                    this.get('owner', { decode: true, string: false }),
                    this.get('target', { decode: true, string: false }),
                    this.get('data', { decode: true, string: false }),
                    ArweaveUtils.stringToBuffer(this.quantity),
                    ArweaveUtils.stringToBuffer(this.reward),
                    this.get('last_tx', { decode: true, string: false }),
                    tags
                ]);
            case 2:
                if (!this.data_root) {
                    await this.prepareChunks(this.data);
                }
                const tagList = this.tags.map((tag) => [
                    tag.get('name', { decode: true, string: false }),
                    tag.get('value', { decode: true, string: false })
                ]);
                return await deepHash([
                    ArweaveUtils.stringToBuffer(this.format.toString()),
                    this.get('owner', { decode: true, string: false }),
                    this.get('target', { decode: true, string: false }),
                    ArweaveUtils.stringToBuffer(this.quantity),
                    ArweaveUtils.stringToBuffer(this.reward),
                    this.get('last_tx', { decode: true, string: false }),
                    tagList,
                    ArweaveUtils.stringToBuffer(this.data_size),
                    this.get('data_root', { decode: true, string: false })
                ]);
            default:
                throw new Error(`Unexpected transaction format: ${this.format}`);
        }
    }
}
export function winstonToAr(winstonString, { formatted = false, decimals = 12, trim = true } = {}) {
    let number = stringToBigNum(winstonString, decimals).shiftedBy(-12);
    return formatted ? number.toFormat(decimals) : number.toFixed(decimals);
}
export function arToWinston(arString, { formatted = false } = {}) {
    let number = stringToBigNum(arString).shiftedBy(12);
    return formatted ? number.toFormat() : number.toFixed(0);
}
function stringToBigNum(stringValue, decimalPlaces = 12) {
    return BigNum(stringValue, decimalPlaces);
}
const BigNum = (value, decimals) => {
    // because of the way Vite builds libraries that have both commonjs and es modules :/
    let instance;
    try {
        instance = BigNumber.clone({ DECIMAL_PLACES: decimals });
    }
    catch (error) {
        console.warn('Caught big num issues, try default', error);
        instance = BigNumber.default.clone({ DECIMAL_PLACES: decimals });
    }
    return new instance(value);
};
