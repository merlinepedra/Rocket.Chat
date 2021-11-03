/* eslint-disable new-cap, no-proto */

import ByteBuffer from 'bytebuffer';

// @ts-ignore
const StaticArrayBufferProto = new ArrayBuffer().__proto__;

export function toString(thing: string | ByteBuffer | ArrayBuffer | Buffer | Uint8Array): string {
	if (typeof thing === 'string') {
		return thing;
	}
	return ByteBuffer.wrap(thing).toString('binary');
}

export function toArrayBuffer(thing: undefined): undefined;
export function toArrayBuffer(thing: string | ByteBuffer | ArrayBuffer | Buffer | Uint8Array): ArrayBuffer;
export function toArrayBuffer(thing: string | ByteBuffer | ArrayBuffer | Buffer | Uint8Array | undefined): ArrayBuffer | undefined {
	if (thing === undefined) {
		return undefined;
	}

	// @ts-ignore
	if (thing === Object(thing) && thing.__proto__ === StaticArrayBufferProto) {
		return thing as ArrayBuffer;
	}

	if (typeof thing !== 'string') {
		throw new Error(`Tried to convert a non-string of type ${ typeof thing } to an array buffer`);
	}
	return ByteBuffer.wrap(thing, 'binary').toArrayBuffer();
}

export function joinVectorAndEcryptedData(vector: ArrayLike<number>, encryptedData: ArrayBufferLike): Uint8Array {
	const cipherText = new Uint8Array(encryptedData);
	const output = new Uint8Array(vector.length + cipherText.length);
	output.set(vector, 0);
	output.set(cipherText, vector.length);
	return output;
}

export function splitVectorAndEcryptedData(cipherText: Uint8Array): [vector: Uint8Array, encryptedData: Uint8Array] {
	const vector = cipherText.slice(0, 16);
	const encryptedData = cipherText.slice(16);

	return [vector, encryptedData];
}

export async function encryptRSA(key: CryptoKey, data: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer): Promise<ArrayBuffer> {
	return crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, data);
}

export async function encryptAES(vector: Uint8Array | Int8Array | Int16Array | Int32Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer, key: CryptoKey, data: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer): Promise<ArrayBuffer> {
	return crypto.subtle.encrypt({ name: 'AES-CBC', iv: vector }, key, data);
}

export async function decryptRSA(key: CryptoKey, data: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer): Promise<ArrayBuffer> {
	return crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, data);
}

export async function decryptAES(vector: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer, key: CryptoKey, data: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer): Promise<ArrayBuffer> {
	return crypto.subtle.decrypt({ name: 'AES-CBC', iv: vector }, key, data);
}

export async function generateAESKey(): Promise<CryptoKey> {
	return crypto.subtle.generateKey({ name: 'AES-CBC', length: 128 }, true, ['encrypt', 'decrypt']);
}

export async function generateRSAKey(): Promise<CryptoKeyPair> {
	return crypto.subtle.generateKey({ name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: { name: 'SHA-256' } }, true, ['encrypt', 'decrypt']);
}

export async function exportJWKKey(key: CryptoKey): Promise<JsonWebKey> {
	return crypto.subtle.exportKey('jwk', key);
}

export async function importRSAKey(keyData: JsonWebKey, keyUsages: KeyUsage[] = ['encrypt', 'decrypt']): Promise<CryptoKey> {
	return crypto.subtle.importKey('jwk', keyData, { 	name: 'RSA-OAEP', 	hash: { name: 'SHA-256' } }, true, keyUsages);
}

export async function importAESKey(keyData: JsonWebKey, keyUsages: KeyUsage[] = ['encrypt', 'decrypt']): Promise<CryptoKey> {
	return crypto.subtle.importKey('jwk', keyData, { name: 'AES-CBC' }, true, keyUsages);
}

export async function importRawKey(keyData: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer, keyUsages: KeyUsage[] = ['deriveKey']): Promise<CryptoKey> {
	return crypto.subtle.importKey('raw', keyData, { name: 'PBKDF2' }, false, keyUsages);
}

export async function deriveKey(salt: Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Uint8ClampedArray | Float32Array | Float64Array | DataView | ArrayBuffer, baseKey: CryptoKey, keyUsages: KeyUsage[] = ['encrypt', 'decrypt']): Promise<CryptoKey> {
	const iterations = 1000;
	const hash = 'SHA-256';

	return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash }, baseKey, { name: 'AES-CBC', length: 256 }, true, keyUsages);
}

export async function readFileAsArrayBuffer(file: Blob): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function(): void {
			resolve(reader.result as ArrayBuffer);
		};
		reader.onerror = function(evt): void {
			reject(evt);
		};
		reader.readAsArrayBuffer(file);
	});
}
