export const ed25519 = {
	// TODO: Separate the key types, ed25519, RSA, BLS, etc
	generateKeypair: () => {
		if (!assertReady())
			return new Error(
				'Wallet not connected or initialized. Run connect() and await initialize() first.'
			);
		let keypair = wasmWallet.generate_ed25519_keypair();
		let publicKey = keypair.public();
		let secretKey = keypair.secret();
		return { publicKey, secretKey };
	}
};
