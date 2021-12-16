export const shorten = (key: string, start = 5, end = 5) => {
	return key.slice(0, start) + '...' + key.slice(key.length - end, key.length);
};

export const shortenURL = (key: string) => {
	const tail = 30;
	const start = 'https://'.length; // key.slice(start, Math.min(start, 8)) +
	const end = Math.max(key.length - tail, 0);
	const maybeEllips = key.length > tail ? '..' : '';
	return maybeEllips + key.slice(end, key.length);
};
