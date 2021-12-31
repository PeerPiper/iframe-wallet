import * as ArweaveUtils from './utils';
export default async function deepHash(data) {
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
async function deepHashChunks(chunks, acc) {
    if (chunks.length < 1) {
        return acc;
    }
    const hashPair = ArweaveUtils.concatBuffers([acc, await deepHash(chunks[0])]);
    const newAcc = await crypto.subtle.digest('SHA-384', hashPair);
    return await deepHashChunks(chunks.slice(1), newAcc);
}
