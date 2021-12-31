/* tslint:disable */
/* eslint-disable */
/**
* @returns {SimpleKeypair}
*/
export function generate_ed25519_keypair(): SimpleKeypair;
/**
* @param {any} secret_key_bytes
* @param {Uint8Array} message
* @returns {Uint8Array}
*/
export function sign(secret_key_bytes: any, message: Uint8Array): Uint8Array;
/**
* @param {Uint8Array} public_key
* @param {Uint8Array} message
* @param {Uint8Array} signature
* @returns {boolean}
*/
export function verify(public_key: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean;
/**
* @param {any} secret
* @returns {SimpleKeypair}
*/
export function generate_ed25519_keypair_from_seed(secret: any): SimpleKeypair;
/**
*/
export class Proxcryptor {
  free(): void;
/**
* @param {any} secret
* @returns {Proxcryptor}
*/
  static new(secret: any): Proxcryptor;
/**
* @returns {any}
*/
  public_key(): any;
/**
* @returns {any}
*/
  public_key_base58(): any;
/**
* @param {Uint8Array} data
* @param {string} tag
* @returns {any}
*/
  self_encrypt(data: Uint8Array, tag: string): any;
/**
* @param {any} encrypted_message
* @returns {any}
*/
  self_decrypt(encrypted_message: any): any;
/**
* @param {any} public_key
* @param {string} tag
* @returns {any}
*/
  generate_re_key(public_key: any, tag: string): any;
/**
* @param {any} target_keypair
* @param {any} encrypted_message
* @param {any} re_key
* @returns {any}
*/
  static re_encrypt(target_keypair: any, encrypted_message: any, re_key: any): any;
/**
* @param {any} rem
* @returns {any}
*/
  re_decrypt(rem: any): any;
}
/**
*/
export class SimpleKeypair {
  free(): void;
/**
* @returns {any}
*/
  public(): any;
/**
* @returns {any}
*/
  secret(): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_simplekeypair_free: (a: number) => void;
  readonly simplekeypair_public: (a: number) => number;
  readonly simplekeypair_secret: (a: number) => number;
  readonly generate_ed25519_keypair: () => number;
  readonly sign: (a: number, b: number, c: number, d: number) => void;
  readonly verify: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly generate_ed25519_keypair_from_seed: (a: number) => number;
  readonly __wbg_proxcryptor_free: (a: number) => void;
  readonly proxcryptor_new: (a: number) => number;
  readonly proxcryptor_public_key: (a: number) => number;
  readonly proxcryptor_public_key_base58: (a: number) => number;
  readonly proxcryptor_self_encrypt: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly proxcryptor_self_decrypt: (a: number, b: number) => number;
  readonly proxcryptor_generate_re_key: (a: number, b: number, c: number, d: number) => number;
  readonly proxcryptor_re_encrypt: (a: number, b: number, c: number) => number;
  readonly proxcryptor_re_decrypt: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
