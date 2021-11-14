import * as ArweaveUtils from './utils';

// In TypeScript 3.7, could be written as a single type:
// `type DeepHashChunk = Uint8Array | DeepHashChunk[];`
type DeepHashChunk = Uint8Array | DeepHashChunks;
interface DeepHashChunks extends Array<DeepHashChunk> {}

export default async function deepHash(data: DeepHashChunk): Promise<Uint8Array> {
	if (Array.isArray(data)) {
		const tag = ArweaveUtils.concatBuffers([
			ArweaveUtils.stringToBuffer('list'),
			ArweaveUtils.stringToBuffer(data.length.toString())
		]);

		return await deepHashChunks(data, await crypto.subtle.digest('SHA-384', tag));
	}

	const tag = ArweaveUtils.concatBuffers([
		ArweaveUtils.stringToBuffer('blob'),
		ArweaveUtils.stringToBuffer(data.byteLength.toString())
	]);

	const taggedHash = ArweaveUtils.concatBuffers([
		await crypto.subtle.digest('SHA-384', tag),
		await crypto.subtle.digest('SHA-384', data)
	]);

	return await crypto.subtle.digest('SHA-384', taggedHash);
}

async function deepHashChunks(chunks: DeepHashChunks, acc: Uint8Array): Promise<Uint8Array> {
	if (chunks.length < 1) {
		return acc;
	}

	const hashPair = ArweaveUtils.concatBuffers([acc, await deepHash(chunks[0])]);
	const newAcc = await crypto.subtle.digest('SHA-384', hashPair);
	return await deepHashChunks(chunks.slice(1), newAcc);
}
