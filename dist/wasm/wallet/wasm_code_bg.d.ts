/**
* @returns {Keypair}
*/
export function generate_ed25519_keypair(): Keypair;
/**
* @param {any} secret
* @returns {Keypair}
*/
export function generate_ed25519_keypair_from_seed(secret: any): Keypair;
export function __wbindgen_json_parse(arg0: any, arg1: any): number;
export function __wbindgen_object_drop_ref(arg0: any): void;
export function __wbindgen_is_object(arg0: any): boolean;
export function __wbindgen_is_null(arg0: any): boolean;
export function __wbindgen_is_undefined(arg0: any): boolean;
export function __wbindgen_boolean_get(arg0: any): number;
export function __wbindgen_number_get(arg0: any, arg1: any): void;
export function __wbindgen_string_get(arg0: any, arg1: any): void;
export function __wbindgen_object_clone_ref(arg0: any): number;
export function __wbg_get_2d1407dba3452350(arg0: any, arg1: any): number;
export function __wbg_getRandomValues_98117e9a7e993920(...args: any[]): any;
export function __wbg_randomFillSync_64cc7d048f228ca8(...args: any[]): any;
export function __wbg_process_2f24d6544ea7b200(arg0: any): number;
export function __wbg_versions_6164651e75405d4a(arg0: any): number;
export function __wbg_node_4b517d861cbcb3bc(arg0: any): number;
export function __wbindgen_is_string(arg0: any): boolean;
export function __wbg_modulerequire_3440a4bcf44437db(...args: any[]): any;
export function __wbg_crypto_98fc271021c7d2ad(arg0: any): number;
export function __wbg_msCrypto_a2cdb043d2bfe57f(arg0: any): number;
export function __wbindgen_is_function(arg0: any): boolean;
export function __wbg_newnoargs_be86524d73f67598(arg0: any, arg1: any): number;
export function __wbg_next_c4151d46d5fa7097(arg0: any): number;
export function __wbg_done_b06cf0578e89ff68(arg0: any): any;
export function __wbg_value_e74a542443d92451(arg0: any): number;
export function __wbg_iterator_4fc4ce93e6b92958(): number;
export function __wbindgen_string_new(arg0: any, arg1: any): number;
export function __wbg_isArray_eb7ad55f2da67dde(arg0: any): boolean;
export function __wbg_instanceof_ArrayBuffer_764b6d4119231cb3(arg0: any): boolean;
export function __wbg_values_364ae56c608e6824(arg0: any): number;
export function __wbg_new_342a24ca698edd87(arg0: any, arg1: any): number;
export function __wbg_call_888d259a5fefc347(...args: any[]): any;
export function __wbg_next_7720502039b96d00(...args: any[]): any;
export function __wbg_isSafeInteger_0dfc6d38b7184f06(arg0: any): boolean;
export function __wbg_self_c6fbdfc2918d5e58(...args: any[]): any;
export function __wbg_window_baec038b5ab35c54(...args: any[]): any;
export function __wbg_globalThis_3f735a5746d41fbd(...args: any[]): any;
export function __wbg_global_1bc0b39582740e95(...args: any[]): any;
export function __wbg_buffer_397eaa4d72ee94dd(arg0: any): number;
export function __wbg_new_a7ce447f15ff496f(arg0: any): number;
export function __wbg_set_969ad0a60e51d320(arg0: any, arg1: any, arg2: any): void;
export function __wbg_length_1eb8fc608a0d4cdb(arg0: any): any;
export function __wbg_instanceof_Uint8Array_08a1f3a179095e76(arg0: any): boolean;
export function __wbg_newwithlength_929232475839a482(arg0: any): number;
export function __wbg_subarray_8b658422a224f479(arg0: any, arg1: any, arg2: any): number;
export function __wbg_get_4d0f21c2f823742e(...args: any[]): any;
export function __wbindgen_debug_string(arg0: any, arg1: any): void;
export function __wbindgen_throw(arg0: any, arg1: any): void;
export function __wbindgen_memory(): number;
/**
*/
export class Keypair {
    static __wrap(ptr: any): any;
    __destroy_into_raw(): number;
    ptr: number;
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
/**
*/
export class Proxcryptor {
    static __wrap(ptr: any): any;
    /**
    * @param {any} secret
    * @returns {Proxcryptor}
    */
    static new(secret: any): Proxcryptor;
    /**
    * @param {any} target_keypair
    * @param {any} encrypted_message
    * @param {any} re_key
    * @returns {any}
    */
    static re_encrypt(target_keypair: any, encrypted_message: any, re_key: any): any;
    __destroy_into_raw(): number;
    ptr: number;
    free(): void;
    /**
    * @param {string} data
    * @param {string} tag
    * @returns {any}
    */
    self_encrypt(data: string, tag: string): any;
    /**
    * @param {any} keypair
    * @param {string} tag
    * @returns {any}
    */
    generate_re_key(keypair: any, tag: string): any;
    /**
    * @param {any} rem
    * @returns {any}
    */
    re_decrypt(rem: any): any;
}
