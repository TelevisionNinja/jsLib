class listNode {
    constructor(value, nextNode, previousNode) {
        this.value = value;
        this.next = nextNode;
        this.previous = previousNode;
    }
}

export class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.length = 0;
    }

    /**
     * 
     * @param {DoublyLinkedList} list 
     */
    copyConstructor(list) {
        let copy = new listNode(null, null, null);
        this.head = copy;

        // iterate through the list to copy the nodes
        let currentNode = list.head;

        while (currentNode !== null) {
            copy.next = new listNode(currentNode.value, null, null);
            copy = copy.next;
            this.tail = copy;
            currentNode = currentNode.next;

            this.length++;
        }

        // clean up the first node
        copy = this.head;
        this.head = copy.next;
        // delete copy
    }

    insertHead(value) {
        const newNode = new listNode(value, this.head, null);

        if (this.head === null) {
            this.tail = newNode;
        }
        else {
            this.head.previous = newNode;
        }

        this.head = newNode;
        this.length++;
    }

    insertTail(value) {
        const newNode = new listNode(value, null, this.tail);

        if (this.tail === null) {
            this.head = newNode;
        }
        else {
            this.tail.next = newNode;
        }

        this.tail = newNode;
        this.length++;
    }

    sortedInsert(value) {
        const newNode = new listNode(value, null, null);

        // insert into empty list
        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        }

        // insert before head
        else if (value <= this.head.value) {
            newNode.next = this.head;
            this.head.previous = newNode;
            this.head = newNode;
        }

        // insert after tail
        else if (value >= this.tail.value) {
            newNode.previous = this.tail;
            this.tail.next = newNode;
            this.tail = newNode;
        }

        // insert in the middle
        else {
            // linear search
            let currentNode = this.head;

            while (currentNode !== null && currentNode.value < value) {
                currentNode = currentNode.next;
            }

            // connect the node to the list
            newNode.next = currentNode;
            newNode.previous = currentNode.previous;
            currentNode.previous.next = newNode;
            currentNode.previous = newNode;
        }

        this.length++;
    }

    /**
     * linear search
     * 
     * @param {*} value 
     * @returns 
     */
    #search(value) {
        let currentNode = this.head;

        while (currentNode !== null && currentNode.value !== value) {
            currentNode = currentNode.next;
        }

        return currentNode;
    }

    /**
     * linear search
     * 
     * @param {*} value 
     * @returns boolean
     */
    search(value) {
        return this.#search(value) !== null;
    }

    /**
     * 
     * @param {*} value 
     * @returns boolean
     */
    delete(value) {
        // linear search
        const currentNode = this.#search(value);

        // check if the value was found
        if (currentNode === null) {
            return false;
        }

        // connect the previous node to the next node
        if (currentNode === this.head) {
            this.head = currentNode.next;
        }
        else {
            currentNode.previous.next = currentNode.next;
        }

        // connect the next node to the previous node
        if (currentNode === this.tail) {
            this.tail = currentNode.previous;
        }
        else {
            currentNode.next.previous = currentNode.previous;
        }

        this.length--;
        // delete currentNode
        return true;
    }

    toString(separator = '\n') {
        let str = '';
        let node = this.head;

        while (node !== null) {
            str = `${str}${node.value}${separator}`;
            node = node.next;
        }

        return str;
    }

    isEmpty() {
        return this.head === null;
    }

    get length() {
        return this.length;
    }
}
