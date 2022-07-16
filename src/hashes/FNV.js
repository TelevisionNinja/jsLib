// Fowler Noll Vo hash

const FNV_offset_basis = 2166136261;
const FNV_prime = 16777619;

/**
 * 32 bit
 * 
 * @param {*} string 
 * @returns 
 */
export function fnv1a(string) {
    if (typeof string !== 'string') {
        string = string.toString();
    }

    let hash = FNV_offset_basis;

    for (let i = 0, n = string.length; i < n; i++) {
        hash ^= string.charCodeAt(i);
        hash *= FNV_prime;
    }

    return hash;
}
