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

        this.updateFrequency(node);

        return node.value;
    }

    put(key, value) {
        if (this.#limit <= 0) {
            return;
        }

        const node = this.#nodeMap.get(key);

        if (typeof node !== 'undefined') {
            // Key already exists, update the value and touch it
            node.value = value;
            this.updateFrequency(node);
            return;
        }

        if (this.#nodeMap.size === this.#limit) {
            // No capacity, need to remove one entry that
            // 1. has the lowest frequency
            // 2. least recently used if there are multiple ones

            // Step 1: remove the element from minimum frequency list
            const minimunFrequencyList = this.#frequencyMap.get(this.#minimumFrequency);
            const key_to_evict = minimunFrequencyList.tail.key;
            minimunFrequencyList.deleteTail();

            // Step 2: remove the key from cache
            this.#nodeMap.delete(key_to_evict);
        }

        // We know new item has frequency of 1, thus set min_freq to 1
        const frequency = 1;
        this.#minimumFrequency = frequency;

        // check if the list for the frequency exists
        let frequencyList = this.#frequencyMap.get(frequency);

        if (typeof frequencyList === 'undefined') {
            frequencyList = new DoublyLinkedList();
            this.#frequencyMap.set(frequency, frequencyList);
        }

        // Add the key to the frequency list
        const newHead = frequencyList.insertHeadNode(new Node(key, value, 1, null, null));

        // Create a new node
        this.#nodeMap.set(key, newHead);
    }

    updateFrequency(node) {
        // Step 1: update the frequency
        const oldFrequencyList = this.#frequencyMap.get(node.frequency);

        if (typeof oldFrequencyList !== 'undefined') {
            // Step 2: remove the entry from old frequency list
            oldFrequencyList.deleteNode(node);

            if (oldFrequencyList.length === 0 && node.frequency === this.#minimumFrequency) {
                // Delete the list
                this.#frequencyMap.delete(node.frequency);

                // Increase the min frequency
                this.#minimumFrequency++;
            }
        }

        //----------------------------------------------------

        node.frequency++;
        let nextList = this.#frequencyMap.get(node.frequency);

        // Step 4: insert the key into the front of the new frequency list
        if (typeof nextList === 'undefined') {
            nextList = new DoublyLinkedList();
            this.#frequencyMap.set(node.frequency, nextList);
        }

        nextList.insertHeadNode(node);
    }
}
