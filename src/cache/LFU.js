// least frequently used cache

import { DoublyLinkedList } from '../data structures/doubly linked list.js';

class Node {
    constructor(key, value, frequency, nextNode, previousNode) {
        this.key = key;
        this.value = value;
        this.frequency = frequency;
        this.next = nextNode;
        this.previous = previousNode;
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

        if (oldFrequencyList.length === 0) {
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
}
