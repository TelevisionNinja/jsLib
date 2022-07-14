// time to live cache

export class Cache {
    #cache = new Map();
    #ttl = 1000 * 60; // time to live, 1 min default

    /**
     * 
     * @param {Number} ttl this is in milliseconds, default of 1 minute
     */
    constructor(ttl = null) {
        if (ttl !== null && ttl !== undefined) {
            this.#ttl = ttl;
        }
    }

    /**
     * resets the entry's timeout time
     * 
     * @param {*} key 
     * @param {*} entry 
     */
    #cacheHit(key, entry) {
        clearTimeout(entry.timeoutID);
        entry.timeoutID = setTimeout(() => this.#cache.delete(key), this.#ttl);
    }

    /**
     * check if the key is in the cache
     * 
     * @param {*} key 
     * @returns bool
     */
    has(key) {
        return this.#cache.has(key);
    }

    /**
     * removes the entry
     * 
     * @param {*} key 
     */
    delete(key) {
        const entry = this.#cache.get(key);

        if (typeof entry !== 'undefined') {
            clearTimeout(entry.timeoutID);
            this.#cache.delete(key);
        }
    }

    /**
     * returns the data for the key
     * 
     * @param {*} key 
     * @returns cached item or null
     */
    get(key) {
        const entry = this.#cache.get(key);

        if (typeof entry === 'undefined') {
            return null;
        }

        this.#cacheHit(key, entry);

        return entry.data;
    }

    /**
     * replaces the data for the key if there is an existing entry
     * 
     * calling this will reset the ttl for the key
     * 
     * @param {*} key 
     * @param {*} data 
     */
    set(key, data) {
        const entry = this.#cache.get(key);

        if (typeof entry === 'undefined') {
            this.#cache.set(key, {
                data: data,
                timeoutID: setTimeout(() => this.#cache.delete(key), this.#ttl)
            });
        }
        else {
            this.#cacheHit(key, entry);
            entry.data = data;
        }
    }

    get size() {
        return this.#cache.size;
    }

    get ttl() {
        return this.#ttl;
    }
}
