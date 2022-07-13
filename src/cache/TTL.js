export class Cache {
    /**
     * 
     * @param {Number} TTL this is in milliseconds, default of 1 minute
     */
    constructor(TTL = null) {
        this.cache = new Map();

        // 1 min default
        if (TTL === null) {
            this.expiryTime = 1000 * 60;
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
        entry.timeoutID = setTimeout(() => cache.delete(key), expiryTime);
    }

    /**
     * updates the entry's data with new data
     * 
     * @param {*} key 
     * @param {*} entry 
     * @param {*} data 
     */
    #replaceEntryData(key, entry, data) {
        this.#cacheHit(key, entry);
        entry.data = data;
    }

    /**
     * check if the id is in the cache
     * 
     * @param {*} key 
     * @returns bool
     */
    has(key) {
        return cache.has(key);
    }

    /**
     * removes the entry
     * 
     * @param {*} key 
     */
    remove(key) {
        const entry = cache.get(key);

        if (typeof entry !== 'undefined') {
            clearTimeout(entry.timeoutID);
            cache.delete(key);
        }
    }

    /**
     * returns the data for the id
     * 
     * @param {*} key 
     * @returns cached item
     */
    get(key) {
        const entry = cache.get(key);

        if (typeof entry === 'undefined') {
            return null;
        }

        this.#cacheHit(key, entry);
        //cache.set(id, element);

        return entry.data;
    }

    /**
     * this does not reset the timeout for the id if there is an existing entry
     * 
     * @param {*} key 
     * @param {*} data 
     */
    insert(key, data) {
        cache.set(key, {
            data: data,
            timeoutID: setTimeout(() => cache.delete(key), expiryTime)
        });
    }

    /**
     * replaces the data for the id
     * 
     * @param {*} key 
     * @param {*} data 
     */
    replace(key, data) {
        const entry = cache.get(key);

        if (typeof entry !== 'undefined') {
            this.#replaceEntryData(key, entry, data);
            //cache.set(id, element);
        }
    }

    /**
     * replaces the data for the id if there is an existing entry
     * 
     * @param {*} key 
     * @param {*} data 
     */
    upsert(key, data) {
        const entry = cache.get(key);

        if (typeof entry === 'undefined') {
            insert(key, data);
        }
        else {
            this.#replaceEntryData(key, entry, data);
            //cache.set(id, element);
        }
    }
}
