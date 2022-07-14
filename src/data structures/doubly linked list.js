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

            // this.length++; // if the list does not have a length variable
        }

        // clean up the first node
        copy = this.head;
        this.head = copy.next;
        // delete copy; or GC

        this.length = list.length;
    }

    insertHead(value) {
        const newNode = new Node(value, this.head, null);

        return insertHeadNode(newNode);
    }

    /**
     * 
     * @param {Node} node 
     * @returns 
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
        this.length++;

        return this.head;
    }

    insertTail(value) {
        const newNode = new Node(value, null, this.tail);

        return insertTailNode(newNode);
    }

    insertTailNode(node) {
        node.next = null
        node.previous = this.tail;

        if (this.tail === null) {
            this.head = node;
        }
        else {
            this.tail.next = node;
        }

        this.tail = node;
        this.length++;

        return this.tail;
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

        return newNode;
    }

    /**
     * linear search
     * 
     * @param {*} value 
     * @returns 
     */
    searchNode(value) {
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
    searchValue(value) {
        return this.searchNode(value) !== null;
    }

    /**
     * finds and deletes a value in the list
     * 
     * @param {*} value 
     * @returns boolean
     */
    delete(value) {
        // linear search
        const currentNode = this.searchNode(value);

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
        // delete detached node; or GC
        return true;
    }

    clear() {
        // manual memory management
        // while (this.head !== null) {
        //     const currentNode = this.head;
        //     this.head = this.head.next;
        //     // delete currentNode;
        // }

        this.head = null;
        this.tail = null;
        this.length = 0;
    }
}
