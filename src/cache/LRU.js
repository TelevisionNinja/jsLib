// least recently used cache

class Node {
    constructor(key, value, nextNode, previousNode) {
        this.key = key;
        this.value = value;
        this.next = nextNode;
        this.previous = previousNode;
    }
}

export class Cache {
    #limit;
    #nodeMap = new Map();
    #tail = null;
    #head = null;

    constructor(limit) {
        this.#limit = limit;
    }

    get(key) {
        const node = this.#nodeMap.get(key);

        if (typeof node === 'undefined') {
            return null;
        }

        this.#deleteNode(node);
        this.#insertHead(node);

        return node.value;
    }

    set(key, value) {
        let node = this.#nodeMap.get(key);

        if (typeof node === 'undefined') {
            if (this.#nodeMap.size === this.#limit) {
                this.#nodeMap.delete(this.#tail.key);
                this.#deleteNode(this.#tail);
            }

            node = new Node(key, value, null, null);
            this.#nodeMap.set(key, node);
        }
        else {
            this.#deleteNode(node);
            node.value = value;
        }

        this.#insertHead(node);
    }

    delete(key) {
        const node = this.#nodeMap.get(key);

        return this.#deleteNode(node);
    }

    has(key) {
        return this.#nodeMap.has(key);
    }

    /**
     * 
     * @param {Node} node 
     */
    #insertHead(node) {
        node.next = this.#head;
        node.previous = null;

        if (this.#head === null) {
            this.#tail = node;
        }
        else {
            this.#head.previous = node;
        }

        this.#head = node;
    }

    /**
     * 
     * @param {Node} node 
     * @returns 
     */
    #deleteNode(node) {
        // check if the value was found
        if (node === null) {
            return;
        }

        // connect the previous node to the next node
        if (node === this.#head) {
            this.#head = node.next;
        }
        else {
            node.previous.next = node.next;
        }

        // connect the next node to the previous node
        if (node === this.#tail) {
            this.#tail = node.previous;
        }
        else {
            node.next.previous = node.previous;
        }

        // delete detached node; or GC
    }

    get size() {
        return this.#nodeMap.size;
    }

    get limit() {
        return this.#limit;
    }

    clear() {
        this.#nodeMap.clear();
        this.#head = null;
        this.#tail = null;
    }
}

/**
 * uses javascript features
 */
export class CacheJs {
    #cache = new Map();
    #limit;

    constructor(limit) {
        this.#limit = limit;
    }

    get(key) {
        if (this.#cache.has(key)) { // this is to allow undefined or null values
            const entry = this.#cache.get(key);
            this.#cache.delete(key);
            this.#cache.set(key, entry);

            return entry;
        }

        return null;
    }

    set(key, value) {
        if (this.#cache.has(key)) {
            this.#cache.delete(key);
        }
        else if (this.#cache.size === this.#limit) {
            this.#cache.delete(this.#LRU());
        }

        this.#cache.set(key, value);
    }

    delete(key) {
        this.#cache.delete(key);
    }

    has(key) {
        return this.#cache.has(key);
    }

    /**
     * possible bc entries, keys, and values are in the order of entry insertion
     * 
     * @returns 
     */
    #LRU() {
        return this.#cache.keys().next().value;
    }

    get size() {
        return this.#cache.size;
    }

    get limit() {
        return this.#limit;
    }

    clear() {
        this.#cache.clear();
    }
}
