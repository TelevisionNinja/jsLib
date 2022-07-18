/**
 * unsigned 32 bit
 * 
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
function multiply(x, y) {
	/*
	get the low part (x & 0xffff) * y
		mask to get low part
		multiply

	get the high part ((x >>> 16) * y) & 0xffff) << 16
		shift high part to low area
		multiply
		shift back up to high area

	combine high and low to get the result
	*/
	return ((x & 0xffff) * y) + ((((x >>> 16) * y) & 0xffff) << 16);
}

/**
 * unsigned 32 bit
 * 
 * @param {*} number 
 * @param {*} n 
 * @returns 
 */
function rotateLeft(number, n) {
	return (number << n) | (number >>> (32 - n));
}

/**
 * unsigned 32 bit
 * 
 * @param {*} k 
 * @returns 
 */
function murmur3Scramble(k) {
	k = multiply(k, 0xcc9e2d51);
	k = rotateLeft(k, 15);
	return multiply(k, 0x1b873593);
}

/**
 * unsigned 32 bit
 * 
 * @param {*} string 
 * @param {*} seed 
 * @returns 
 */
export function murmur3(string, seed) {
	const remainder = string.length & 3;
	const bytes = string.length - remainder;
	let hash = seed;
	let i = 0;

	while (i < bytes) {
	  	const k = (string.charCodeAt(i) & 0xff) |
            ((string.charCodeAt(i + 1) & 0xff) << 8) |
            ((string.charCodeAt(i + 2) & 0xff) << 16) |
            ((string.charCodeAt(i + 3) & 0xff) << 24);

		i += 4;

		hash ^= murmur3Scramble(k);
        hash = rotateLeft(hash, 13);
		hash = multiply(hash, 5) + 0xe6546b64;
	}

	let k = 0;

	switch (remainder) {
		case 3:
            k ^= (string.charCodeAt(i + 2) & 0xff) << 16;
		case 2:
            k ^= (string.charCodeAt(i + 1) & 0xff) << 8;
		case 1:
            k ^= string.charCodeAt(i) & 0xff;

			hash ^= murmur3Scramble(k);
	}

	hash ^= string.length;

	hash ^= hash >>> 16;
	hash = multiply(hash, 0x85ebca6b);
	hash ^= hash >>> 13;
	hash = multiply(hash, 0xc2b2ae35);
	hash ^= hash >>> 16;

	return hash >>> 0; // make unsigned 32 bit integer
}
