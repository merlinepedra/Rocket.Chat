// @ts-nocheck
export function isIterable(obj): boolean {
	// checks for null and undefined
	if (obj == null) {
		return false;
	}
	return typeof obj[Symbol.iterator] === 'function';
}
