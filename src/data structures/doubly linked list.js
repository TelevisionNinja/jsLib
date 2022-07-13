class Node {
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
        let copy = new Node(null, null, null);
        this.head = copy;

        // iterate through the list to copy the nodes
        let currentNode = list.head;

        while (currentNode !== null) {
            copy.next = new Node(currentNode.value, null, null);
            copy = copy.next;
            this.tail = copy;
            currentNode = currentNode.next;

            this.length++;
        }

        // clean up the first node
        copy = this.head;
        this.head = copy.next;
        // delete copy;
    }

    insertHead(value) {
        const newNode = new Node(value, this.head, null);

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
        const newNode = new Node(value, null, this.tail);

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
        const newNode = new Node(value, null, null);

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
     * finds and deletes a value in the list
     * 
     * @param {*} value 
     * @returns boolean
     */
    delete(value) {
        // linear search
        const currentNode = this.#search(value);

        return deleteNode(currentNode);
    }

    /**
     * 
     * @param {*} separator default is "\n"
     * @returns string
     */
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

    /**
     * 
     * @returns boolean
     */
    deleteHead() {
        return deleteNode(this.head);
    }

    /**
     * 
     * @returns boolean
     */
    deleteTail() {
        return deleteNode(this.tail);
    }

    /**
     * 
     * @param {Node} node 
     * @returns boolean
     */
    deleteNode(node) {
        // check if the value was found
        if (node === null) {
            return false;
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

        this.length--;
        // delete detached node;
        return true;
    }
}
