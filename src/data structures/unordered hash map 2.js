// uses array of hash maps

import { murmur3 } from '../hashes/murmur.js';

class Entry {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }
}

export class UnorderedHashMap {
    #size = 0;
    #entries;
    #seed = 0;
    #collisionHashTable;
    #startingSize;

    /**
     * 
     * @param {Number} startingSize default of 16
     */
    constructor(startingSize) {
        if (!startingSize) {
            this.#startingSize = Math.pow(2, 4);
        }
        else {
            this.#startingSize = startingSize;
        }

        this.#entries = new Array(this.#startingSize);
        this.#collisionHashTable = undefined;
    }

    get(key) {
        const index = this.#hash(key);
        const entry = this.#entries[index];

        if (typeof entry === 'undefined') {
            return null;
        }

        if (key === entry.key) {
            return entry.value;
        }

        if (typeof this.#collisionHashTable === 'undefined') {
            return null;
        }

        return this.#collisionHashTable.get(key);
    }

    set(key, value) {
        const index = this.#hash(key);
        const entry = this.#entries[index];

        if (typeof entry === 'undefined') {
            this.#entries[index] = new Entry(key, value);
            this.#size++;
            return;
        }

        if (key === entry.key) {
            entry.value = value;
            return;
        }

        if (typeof this.#collisionHashTable === 'undefined') {
            this.#collisionHashTable = new UnorderedHashMap(this.#entries.length * 2);
            this.#collisionHashTable.#seed = this.#seed + 1;
        }

        this.#collisionHashTable.set(key, value);
        this.#size++;
    }

    clear() {
        this.#size = 0;
        this.#entries = new Array(this.#startingSize);
        this.#collisionHashTable = undefined;
    }

    delete(key) {
        const index = this.#hash(key);
        const entry = this.#entries[index];

        if (typeof entry === 'undefined') {
            return;
        }

        if (key === entry.key) { // the entry is in this hash map
            if (typeof this.#collisionHashTable === 'undefined') {
                this.#entries[index] = undefined; // delete this.#entries[index]
            }
            else {
                entry.value = this.#collisionHashTable.get(key); // move an entry form the collision hash table to this hash table
                this.#collisionHashTable.delete(key);

                if (this.#collisionHashTable.#size === 0) {
                    this.#collisionHashTable = undefined; // delete the collision hash table
                }
            }

            this.#size--;
        }
        else {
            if (typeof this.#collisionHashTable === 'undefined') {
                return;
            }

            const previousSize = this.#collisionHashTable.#size;
            this.#collisionHashTable.delete(key);

            if (previousSize > this.#collisionHashTable.#size) {
                this.#size--;

                if (this.#collisionHashTable.#size === 0) {
                    this.#collisionHashTable = undefined; // delete the collision hash table
                }
            }
        }
    }

    get size() {
        return this.#size;
    }

    /**
     * 
     * @param {*} string or any
     * @returns 
     */
    #hash(string) {
        if (typeof string !== 'string') {
            string = string.toString();
        }

        return murmur3(string, this.#seed) % this.#entries.length;
    }
}
