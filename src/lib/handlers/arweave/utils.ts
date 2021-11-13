import * as B64 from 'base64-js';

export type Base64UrlString = string;

export function concatBuffers(buffers: Uint8Array[] | ArrayBuffer[]): Uint8Array {
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

export function b64UrlToString(b64UrlString: string): string {
	let buffer = b64UrlToBuffer(b64UrlString);

	// TextEncoder will be available in browsers, but not in node
	if (typeof TextDecoder == 'undefined') {
		const TextDecoder = require('util').TextDecoder;
		return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
	}

	return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
}

export function bufferToString(buffer: Uint8Array | ArrayBuffer): string {
	// TextEncoder will be available in browsers, but not in node
	if (typeof TextDecoder == 'undefined') {
		const TextDecoder = require('util').TextDecoder;
		return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
	}

	return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
}

export function stringToBuffer(string: string): Uint8Array {
	// TextEncoder will be available in browsers, but not in node
	if (typeof TextEncoder == 'undefined') {
		const TextEncoder = require('util').TextEncoder;
		return new TextEncoder().encode(string);
	}
	return new TextEncoder().encode(string);
}

export function stringToB64Url(string: string): string {
	return bufferTob64Url(stringToBuffer(string));
}

export function b64UrlToBuffer(b64UrlString: string): Uint8Array {
	return new Uint8Array(B64.toByteArray(b64UrlDecode(b64UrlString)));
}

export function bufferTob64(buffer: Uint8Array): string {
	return B64.fromByteArray(new Uint8Array(buffer));
}

export function bufferTob64Url(buffer: Uint8Array): string {
	return b64UrlEncode(bufferTob64(buffer));
}

export function b64UrlEncode(b64UrlString: string): string {
	return b64UrlString.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
}

export function b64UrlDecode(b64UrlString: string): string {
	b64UrlString = b64UrlString.replace(/\-/g, '+').replace(/\_/g, '/');
	let padding;
	b64UrlString.length % 4 == 0 ? (padding = 0) : (padding = 4 - (b64UrlString.length % 4));
	return b64UrlString.concat('='.repeat(padding));
}

export async function getSignatureData(tx): Promise<Uint8Array> {
	switch (tx.format) {
		case 1:
			let tags = tx.tags.reduce((accumulator: Uint8Array, tag: Tag) => {
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

			const tagList: [Uint8Array, Uint8Array][] = tx.tags.map((tag) => [
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

export function setSignature(
	tx,
	{
		id,
		owner,
		reward,
		tags,
		signature
	}: {
		id: string;
		owner: string;
		reward?: string;
		tags?: Tag[];
		signature: string;
	}
) {
	tx.id = id;
	tx.owner = owner;
	if (reward) tx.reward = reward;
	if (tags) tx.tags = tags;
	tx.signature = signature;
	return tx;
}
