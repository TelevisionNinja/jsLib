// least frequently used cache
// also uses least recently used

class Node {
    constructor(key, value, frequency, nextNode, previousNode) {
        this.key = key;
        this.value = value;
        this.frequency = frequency;
        this.next = nextNode;
        this.previous = previousNode;
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
        if (node === null) {
            return;
        }

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
    #minimumFrequency = 0;
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

        if (typeof node !== 'undefined') {
            // Key already exists, update the value and touch it
            node.value = value;
            this.#updateFrequency(node);
            return;
        }

        if (this.#nodeMap.size === this.#limit) {
            // remove an entry from minimum frequency list
            const minimunFrequencyList = this.#frequencyMap.get(this.#minimumFrequency);

            // remove an entry using least recently used policy if there are multiple entries in the list
            const tail = minimunFrequencyList.tail.key;
            minimunFrequencyList.deleteTail();
            this.#nodeMap.delete(tail);
        }

        // new entry has frequency of 1, but any number can be used as the starting list id
        this.#minimumFrequency = 0;

        // Add the key to the frequency list
        const newHead = new Node(key, value, this.#minimumFrequency, null, null);
        this.#insertHead(newHead);

        // Create a new node
        this.#nodeMap.set(key, newHead);
    }

    /**
     * 
     * @param {Node} node 
     */
    #updateFrequency(node) {
        // remove the entry from the old frequency list
        const oldFrequencyList = this.#frequencyMap.get(node.frequency);
        oldFrequencyList.deleteNode(node);

        if (oldFrequencyList.isEmpty()) {
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
