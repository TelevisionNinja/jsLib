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
     * @param {*} id 
     * @param {*} entry 
     */
    #cacheHit(id, entry) {
        clearTimeout(entry.timeoutID);
        entry.timeoutID = setTimeout(() => cache.delete(id), expiryTime);
    }

    /**
     * updates the entry's data with new data
     * 
     * @param {*} id 
     * @param {*} entry 
     * @param {*} data 
     */
    #replaceEntryData(id, entry, data) {
        this.#cacheHit(id, entry);
        entry.data = data;
    }

    /**
     * check if the id is in the cache
     * 
     * @param {*} id 
     * @returns bool
     */
    has(id) {
        return cache.has(id);
    }

    /**
     * removes the entry
     * 
     * @param {*} id 
     */
    remove(id) {
        const entry = cache.get(id);

        if (typeof entry !== 'undefined') {
            clearTimeout(entry.timeoutID);
            cache.delete(id);
        }
    }

    /**
     * returns the data for the id
     * 
     * @param {*} id 
     * @returns cached item
     */
    get(id) {
        const entry = cache.get(id);

        if (typeof entry === 'undefined') {
            return null;
        }

        this.#cacheHit(id, entry);
        //cache.set(id, element);

        return entry.data;
    }

    /**
     * this does not reset the timeout for the id if there is an existing entry
     * 
     * @param {*} id 
     * @param {*} data 
     */
    insert(id, data) {
        cache.set(id, {
            data: data,
            timeoutID: setTimeout(() => cache.delete(id), expiryTime)
        });
    }

    /**
     * replaces the data for the id
     * 
     * @param {*} id 
     * @param {*} data 
     */
    replace(id, data) {
        const entry = cache.get(id);

        if (typeof entry !== 'undefined') {
            this.#replaceEntryData(id, entry, data);
            //cache.set(id, element);
        }
    }

    /**
     * replaces the data for the id if there is an existing entry
     * 
     * @param {*} id 
     * @param {*} data 
     */
    upsert(id, data) {
        const entry = cache.get(id);

        if (typeof entry === 'undefined') {
            insert(id, data);
        }
        else {
            this.#replaceEntryData(id, entry, data);
            //cache.set(id, element);
        }
    }
}
