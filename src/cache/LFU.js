// least frequently used cache
// also uses least recently used

// new entry has frequency of 1, but any number can be used as the starting list id
const minimumFrequency = 0;

class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.frequency = minimumFrequency;
        this.next = null;
        this.previous = null;
    }
}

class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    /**
     * 
     * @param {Node} node 
     */
    insertHeadNode(node) {
        node.next = this.head;
        node.previous = null;

        if (this.head === null) {
            this.tail = node;
        }
        else {
            this.head.previous = node;
        }

        this.head = node;
    }

    isEmpty() {
        return this.head === null;
    }

    deleteTail() {
        if (this.tail === this.head) {
            this.head = null;
            this.tail = null;
        }
        else {
            this.tail = this.tail.previous;
            this.tail.next = null;
        }
    }

    /**
     * 
     * @param {Node} node 
     */
    deleteNode(node) {
        // connect the previous node to the next node
        if (node === this.head) {
            this.head = node.next;
        }
        else {
            node.previous.next = node.next;
        }

        // connect the next node to the previous node
        if (node === this.tail) {
            this.tail = node.previous;
        }
        else {
            node.next.previous = node.previous;
        }

        // delete detached node; or GC
    }
}

export class Cache {
    #minimumFrequency = minimumFrequency;
    #limit;
    #nodeMap = new Map();
    #frequencyMap = new Map();

    constructor(limit) {
        this.#limit = limit;
    }

    get(key) {
        const node = this.#nodeMap.get(key);

        if (typeof node === 'undefined') {
            return null;
        }

        this.#updateFrequency(node);

        return node.value;
    }

    set(key, value) {
        if (this.#limit <= 0) {
            return;
        }

        const node = this.#nodeMap.get(key);

        if (typeof node === 'undefined') {
            if (this.#nodeMap.size === this.#limit) {
                // remove an entry from minimum frequency list
                const minimunFrequencyList = this.#frequencyMap.get(this.#minimumFrequency);

                // remove an entry using least recently used policy if there are multiple entries in the list
                this.#nodeMap.delete(minimunFrequencyList.tail.key);
                minimunFrequencyList.deleteTail();

                // delete any empty lists
                // the minimum frequency is checked so that the list will not be deleted and created
                if (this.#minimumFrequency !== minimumFrequency && minimunFrequencyList.isEmpty()) {
                    this.#frequencyMap.delete(this.#minimumFrequency);
                }
            }

            // new entry has frequency of 1, but any number can be used as the starting list id
            this.#minimumFrequency = minimumFrequency;

            // add node to the frequency list and node map
            const newHead = new Node(key, value);
            this.#insertHead(newHead);
            this.#nodeMap.set(key, newHead);
        }
        else {
            // update the value and frequency
            node.value = value;
            this.#updateFrequency(node);
        }
    }

    /**
     * 
     * @param {Node} node 
     */
    #updateFrequency(node) {
        // remove the entry from the old frequency list
        const list = this.#frequencyMap.get(node.frequency);
        list.deleteNode(node);

        if (list.isEmpty()) {
            // delete any empty lists
            this.#frequencyMap.delete(node.frequency);

            if (node.frequency === this.#minimumFrequency) {
                // increase the minimum frequency
                this.#minimumFrequency++;
            }
        }

        // update the frequency
        node.frequency++;
        this.#insertHead(node);
    }

    /**
     * 
     * @param {Node} node 
     */
    #insertHead(node) {
        let list = this.#frequencyMap.get(node.frequency);

        // check if the list for the frequency exists
        if (typeof list === 'undefined') {
            list = new DoublyLinkedList();
            this.#frequencyMap.set(node.frequency, list);
        }

        // insert the key into the front of the new frequency list
        list.insertHeadNode(node);
    }

    get size() {
        return this.#nodeMap.size;
    }

    get limit() {
        return this.#limit;
    }

    clear() {
        this.#nodeMap.clear();
        this.#frequencyMap.clear();
    }

    has(key) {
        return this.#nodeMap.has(key);
    }

    delete(key) {
        const node = this.#nodeMap.get(key);

        if (typeof node === 'undefined') {
            return;
        }

        this.#nodeMap.delete(key);
        const list = this.#frequencyMap.get(node.frequency);
        list.deleteNode(node);

        // delete any empty lists
        if (list.isEmpty()) {
            this.#frequencyMap.delete(node.frequency);
        }
    }
}
