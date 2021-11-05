/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_keypair_free(a: number): void;
export function keypair_public(a: number): number;
export function keypair_secret(a: number): number;
export function generate_ed25519_keypair(): number;
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
export function __wbindgen_exn_store(a: number): void;
