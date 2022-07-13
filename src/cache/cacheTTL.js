const cache = new Map();
// 1 min
const expiryTime = 1000 * 60;

export default {
    has,
    remove,
    get,
    insert,
    replace,
    upsert
}

/**
 * resets the entry's timeout time
 * 
 * @param {*} id 
 * @param {*} entry 
 */
function cacheHit(id, entry) {
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
function replaceEntryData(id, entry, data) {
    cacheHit(id, entry);
    entry.data = data;
}

/**
 * check if the id is in the cache
 * 
 * @param {*} id 
 * @returns bool
 */
function has(id) {
    return cache.has(id);
}

/**
 * removes the entry
 * 
 * @param {*} id 
 */
function remove(id) {
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
function get(id) {
    const entry = cache.get(id);

    if (typeof entry === 'undefined') {
        return null;
    }

    cacheHit(id, entry);
    //cache.set(id, element);

    return entry.data;
}

/**
 * this does not reset the timeout for the id if there is an existing entry
 * 
 * @param {*} id 
 * @param {*} data 
 */
function insert(id, data) {
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
function replace(id, data) {
    const entry = cache.get(id);

    if (typeof entry !== 'undefined') {
        replaceEntryData(id, entry, data);
        //cache.set(id, element);
    }
}

/**
 * replaces the data for the id if there is an existing entry
 * 
 * @param {*} id 
 * @param {*} data 
 */
function upsert(id, data) {
    const entry = cache.get(id);

    if (typeof entry === 'undefined') {
        insert(id, data);
    }
    else {
        replaceEntryData(id, entry, data);
        //cache.set(id, element);
    }
}
