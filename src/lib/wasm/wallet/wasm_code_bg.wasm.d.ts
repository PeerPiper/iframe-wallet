/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_simplekeypair_free(a: number): void;
export function simplekeypair_public(a: number): number;
export function simplekeypair_secret(a: number): number;
export function generate_ed25519_keypair(): number;
export function sign(a: number, b: number, c: number, d: number): void;
export function verify(a: number, b: number, c: number, d: number, e: number, f: number): number;
export function generate_ed25519_keypair_from_seed(a: number): number;
export function __wbg_proxcryptor_free(a: number): void;
export function proxcryptor_new(a: number): number;
export function proxcryptor_public_key(a: number): number;
export function proxcryptor_public_key_base58(a: number): number;
export function proxcryptor_self_encrypt(a: number, b: number, c: number, d: number, e: number): number;
export function proxcryptor_self_decrypt(a: number, b: number): number;
export function proxcryptor_generate_re_key(a: number, b: number, c: number, d: number): number;
export function proxcryptor_re_encrypt(a: number, b: number, c: number): number;
export function proxcryptor_re_decrypt(a: number, b: number): number;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_exn_store(a: number): void;
