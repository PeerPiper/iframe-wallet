// Svelte stores -- pass data between components and libraries
import { derived, writable } from 'svelte/store';

export const confirmSection = writable(null);

export const confirmed = writable(null);

export const confirm = writable(null);

export const keypairs = writable(new Map());
