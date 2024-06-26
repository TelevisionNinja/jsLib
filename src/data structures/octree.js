const TopLeftFront = 0;
const TopRightFront = 1;
const BottomRightFront = 2;
const BottomLeftFront = 3;
const TopLeftBottom = 4;
const TopRightBottom = 5;
const BottomRightBack = 6;
const BottomLeftBack = 7;

export function create3dVector(x, y, z) {
    return {
        position: {
            x: x,
            y: y,
            z: z,
        }
    };
}

export class Octree {
    constructor(topLeftFrontVector, bottomRightBackVector, startingLimit = 2, limitIncreaseAmount = 1, depthLimit = 32) {
        this.values = [];

        if (startingLimit < 1) {
            this.startingLimit = 1;
        }
        else {
            this.startingLimit = startingLimit;
        }

        this.isSubdivided = false;
        this.topLeftFront = topLeftFrontVector;
        this.bottomRightBack = bottomRightBackVector;
        this.children = [null, null, null, null, null, null, null, null];

        this.limitIncreaseAmount = limitIncreaseAmount;
        this.depthLimit = depthLimit;
        this.depth = 0;
    }

    getMidpoints() {
        const middleX = (this.topLeftFront.position.x + this.bottomRightBack.position.x) / 2;
        const middleY = (this.topLeftFront.position.y + this.bottomRightBack.position.y) / 2;
        const middleZ = (this.topLeftFront.position.z + this.bottomRightBack.position.z) / 2;

        return {
            middleX,
            middleY,
            middleZ
        };
    }

    getChildIndex(vector) {
        // binary search for insertion
        const {
            middleX,
            middleY,
            middleZ
        } = this.getMidpoints();
        let position = 0;

        // get the octant
        if (vector.position.x <= middleX) {
            if (vector.position.y <= middleY) {
                if (vector.position.z <= middleZ) {
                    position = TopLeftFront;
                }
                else {
                    position = TopLeftBottom;
                }
            }
            else {
                if (vector.position.z <= middleZ) {
                    position = BottomLeftFront;
                }
                else {
                    position = BottomLeftBack;
                }
            }
        }
        else {
            if (vector.position.y <= middleY) {
                if (vector.position.z <= middleZ) {
                    position = TopRightFront;
                }
                else {
                    position = TopRightBottom;
                }
            }
            else {
                if (vector.position.z <= middleZ) {
                    position = BottomRightFront;
                }
                else {
                    position = BottomRightBack;
                }
            }
        }

        return {
            position,
            middleX,
            middleY,
            middleZ
        };
    }

    isPointInCube(vector, topLeftFront, bottomRightBack) {
        return vector.position.x >= topLeftFront.position.x
            && vector.position.x <= bottomRightBack.position.x
            && vector.position.y >= topLeftFront.position.y
            && vector.position.y <= bottomRightBack.position.y
            && vector.position.z >= topLeftFront.position.z
            && vector.position.z <= bottomRightBack.position.z;
    }

    insert(vector) {
        if (!this.isPointInCube(vector, this.topLeftFront, this.bottomRightBack)) {
            return;
        }

        if (this.depthLimit <= this.depth || (!this.isSubdivided && this.values.length < this.startingLimit)) {
            this.values.push(vector);
            return;
        }

        const {
            position,
            middleX,
            middleY,
            middleZ
        } = this.getChildIndex(vector);

        const currentChild = this.children[position];

        // add child nodes
        if (currentChild === null) {
            if (position === TopLeftFront) {
                this.children[position] = new Octree(this.topLeftFront,
                                                    create3dVector(middleX, middleY, middleZ),
                                                    this.startingLimit + this.limitIncreaseAmount,
                                                    this.limitIncreaseAmount,
                                                    this.depthLimit);
            }
            else if (position === TopRightFront) {
                this.children[position] = new Octree(create3dVector(middleX, this.topLeftFront.position.y, this.topLeftFront.position.z),
                                                create3dVector(this.bottomRightBack.position.x, middleY, middleZ),
                                                this.startingLimit + this.limitIncreaseAmount,
                                                this.limitIncreaseAmount,
                                                this.depthLimit);
            }
            else if (position === BottomRightFront) {
                this.children[position] = new Octree(create3dVector(middleX, middleY, this.topLeftFront.position.z),
                                                create3dVector(this.bottomRightBack.position.x, this.bottomRightBack.position.y, middleZ),
                                                this.startingLimit + this.limitIncreaseAmount,
                                                this.limitIncreaseAmount,
                                                this.depthLimit);
            }
            else if (position === BottomLeftFront) {
                this.children[position] = new Octree(create3dVector(this.topLeftFront.position.x, middleY, this.topLeftFront.position.z),
                                                create3dVector(middleX, this.bottomRightBack.position.y, middleZ),
                                                this.startingLimit + this.limitIncreaseAmount,
                                                this.limitIncreaseAmount,
                                                this.depthLimit);
            }
            else if (position === TopLeftBottom) {
                this.children[position] = new Octree(create3dVector(this.topLeftFront.position.x, this.topLeftFront.position.y, middleZ),
                                                create3dVector(middleX, middleY, this.bottomRightBack.position.z),
                                                this.startingLimit + this.limitIncreaseAmount,
                                                this.limitIncreaseAmount,
                                                this.depthLimit);
            }
            else if (position === TopRightBottom) {
                this.children[position] = new Octree(create3dVector(middleX, this.topLeftFront.position.y, middleZ),
                                                create3dVector(this.bottomRightBack.position.x, middleY, this.bottomRightBack.position.z),
                                                this.startingLimit + this.limitIncreaseAmount,
                                                this.limitIncreaseAmount,
                                                this.depthLimit);
            }
            else if (position === BottomRightBack) {
                this.children[position] = new Octree(create3dVector(middleX, middleY, middleZ), this.bottomRightBack,
                                                    this.startingLimit + this.limitIncreaseAmount,
                                                    this.limitIncreaseAmount,
                                                    this.depthLimit);
            }
            else if (position === BottomLeftBack) {
                this.children[position] = new Octree(create3dVector(this.topLeftFront.position.x, middleY, middleZ),
                                                create3dVector(middleX, this.bottomRightBack.position.y, this.bottomRightBack.position.z),
                                                this.startingLimit + this.limitIncreaseAmount,
                                                this.limitIncreaseAmount,
                                                this.depthLimit);
            }

            this.children[position].depth = this.depth + 1;

            if (!this.isSubdivided) { // newly subdivided nodes will end up here
                this.isSubdivided = true;

                // clear out this node as it is now subdivided
                const previousValues = this.values;
                this.values = [];

                for (let i = 0; i < previousValues.length; i++) {
                    const currentValue = previousValues[i];
                    this.insert(currentValue);
                }
            }
        }

        this.children[position].insert(vector);
    }

    insertIterative(vector) {
        if (!this.isPointInCube(vector, this.topLeftFront, this.bottomRightBack)) {
            return;
        }

        let insertingValues = [vector];

        while (insertingValues.length > 0) {
            let currentNode = this;
            const currentValue = insertingValues.shift(); // queue

            while (true) {
                if (currentNode.depthLimit <= currentNode.depth || (!currentNode.isSubdivided && currentNode.values.length < currentNode.startingLimit)) {
                    currentNode.values.push(currentValue);
                    break;
                }

                const {
                    position,
                    middleX,
                    middleY,
                    middleZ
                } = currentNode.getChildIndex(currentValue);

                const currentChild = currentNode.children[position];

                // add child nodes
                if (currentChild === null) {
                    if (position === TopLeftFront) {
                        currentNode.children[position] = new OctreeFast(currentNode.topLeftFront,
                                                            create3dVector(middleX, middleY, middleZ),
                                                            currentNode.startingLimit + currentNode.limitIncreaseAmount,
                                                            currentNode.limitIncreaseAmount,
                                                            currentNode.depthLimit);
                    }
                    else if (position === TopRightFront) {
                        currentNode.children[position] = new OctreeFast(create3dVector(middleX, currentNode.topLeftFront.position.y, currentNode.topLeftFront.position.z),
                                                        create3dVector(currentNode.bottomRightBack.position.x, middleY, middleZ),
                                                        currentNode.startingLimit + currentNode.limitIncreaseAmount,
                                                        currentNode.limitIncreaseAmount,
                                                        currentNode.depthLimit);
                    }
                    else if (position === BottomRightFront) {
                        currentNode.children[position] = new OctreeFast(create3dVector(middleX, middleY, currentNode.topLeftFront.position.z),
                                                        create3dVector(currentNode.bottomRightBack.position.x, currentNode.bottomRightBack.position.y, middleZ),
                                                        currentNode.startingLimit + currentNode.limitIncreaseAmount,
                                                        currentNode.limitIncreaseAmount,
                                                        currentNode.depthLimit);
                    }
                    else if (position === BottomLeftFront) {
                        currentNode.children[position] = new OctreeFast(create3dVector(currentNode.topLeftFront.position.x, middleY, currentNode.topLeftFront.position.z),
                                                        create3dVector(middleX, currentNode.bottomRightBack.position.y, middleZ),
                                                        currentNode.startingLimit + currentNode.limitIncreaseAmount,
                                                        currentNode.limitIncreaseAmount,
                                                        currentNode.depthLimit);
                    }
                    else if (position === TopLeftBottom) {
                        currentNode.children[position] = new OctreeFast(create3dVector(currentNode.topLeftFront.position.x, currentNode.topLeftFront.position.y, middleZ),
                                                        create3dVector(middleX, middleY, currentNode.bottomRightBack.position.z),
                                                        currentNode.startingLimit + currentNode.limitIncreaseAmount,
                                                        currentNode.limitIncreaseAmount,
                                                        currentNode.depthLimit);
                    }
                    else if (position === TopRightBottom) {
                        currentNode.children[position] = new OctreeFast(create3dVector(middleX, currentNode.topLeftFront.position.y, middleZ),
                                                        create3dVector(currentNode.bottomRightBack.position.x, middleY, currentNode.bottomRightBack.position.z),
                                                        currentNode.startingLimit + currentNode.limitIncreaseAmount,
                                                        currentNode.limitIncreaseAmount,
                                                        currentNode.depthLimit);
                    }
                    else if (position === BottomRightBack) {
                        currentNode.children[position] = new OctreeFast(create3dVector(middleX, middleY, middleZ), currentNode.bottomRightBack,
                                                            currentNode.startingLimit + currentNode.limitIncreaseAmount,
                                                            currentNode.limitIncreaseAmount,
                                                            currentNode.depthLimit);
                    }
                    else if (position === BottomLeftBack) {
                        currentNode.children[position] = new OctreeFast(create3dVector(currentNode.topLeftFront.position.x, middleY, middleZ),
                                                        create3dVector(middleX, currentNode.bottomRightBack.position.y, currentNode.bottomRightBack.position.z),
                                                        currentNode.startingLimit + currentNode.limitIncreaseAmount,
                                                        currentNode.limitIncreaseAmount,
                                                        currentNode.depthLimit);
                    }

                    currentNode.children[position].depth = currentNode.depth + 1;

                    if (!currentNode.isSubdivided) { // newly subdivided nodes will end up here
                        currentNode.isSubdivided = true;

                        // clear out this node as it is now subdivided
                        insertingValues = [...insertingValues, ...currentNode.values];
                        currentNode.values = [];
                    }
                }

                currentNode = currentNode.children[position];
            }
        }
    }

    /**
     * 
     * @param {*} vector 
     * @returns boolean
     */
    find(vector) {
        if (!this.isPointInCube(vector, this.topLeftFront, this.bottomRightBack)) {
            return false;
        }

        if (!this.isSubdivided) {
            return this.values.indexOf(vector) !== -1;
        }

        const {
            position,
            middleX,
            middleY,
            middleZ
        } = this.getChildIndex(vector);

        const currentChild = this.children[position];

        // the child node is not in use
        if (currentChild === null) {
            return false;
        }
        // the child node has child nodes
        return currentChild.find(vector);
    }

    /**
     * detect unused child nodes
     * @returns boolean
     */
    isNotEmpty() {
        if (this.isSubdivided) {
            for (let i = 0; i < this.children.length; i++) {
                if (this.children[i] !== null) {
                    return true;
                }
            }

            return false;
        }

        return true;
    }

    isCubeIntersecting(topLeftFront, bottomRightBack, topLeftFrontBoundary, bottomRightBackBoundary) {
        return ((topLeftFront.position.x <= topLeftFrontBoundary.position.x && topLeftFrontBoundary.position.x <= bottomRightBack.position.x) || (topLeftFrontBoundary.position.x <= topLeftFront.position.x && topLeftFront.position.x <= bottomRightBackBoundary.position.x)) &&
            ((topLeftFront.position.y <= topLeftFrontBoundary.position.y && topLeftFrontBoundary.position.y <= bottomRightBack.position.y) || (topLeftFrontBoundary.position.y <= topLeftFront.position.y && topLeftFront.position.y <= bottomRightBackBoundary.position.y)) &&
            ((topLeftFront.position.z <= topLeftFrontBoundary.position.z && topLeftFrontBoundary.position.z <= bottomRightBack.position.z) || (topLeftFrontBoundary.position.z <= topLeftFront.position.z && topLeftFront.position.z <= bottomRightBackBoundary.position.z));
    }

    getAllVectors() {
        if (this.isSubdivided) {
            let totalVectors = [];

            for (let i = 0; i < this.children.length; i++) {
                const currentChild = this.children[i];
                if (currentChild !== null) {
                    totalVectors = [...totalVectors, ...currentChild.getAllVectors()];
                }
            }

            return totalVectors;
        }

        return this.values;
    }

    /**
     * 
     * @param {*} topLeftFrontVector 
     * @param {*} bottomRightBackVector 
     * @param {*} limit limit the returned array size
     * @returns array
     */
    getVectors(topLeftFrontVector, bottomRightBackVector, limit = null) {
        if (!this.isCubeIntersecting(topLeftFrontVector, bottomRightBackVector, this.topLeftFront, this.bottomRightBack)) {
            return [];
        }

        if (this.isSubdivided) {
            let totalVectors = [];

            for (let i = 0; i < this.children.length; i++) {
                const currentChild = this.children[i];
                if (currentChild !== null) {
                    totalVectors = [...totalVectors, ...currentChild.getVectors(topLeftFrontVector, bottomRightBackVector)];

                    if (limit !== null && totalVectors.length > limit) {
                        totalVectors.splice(0, limit);
                        return totalVectors;
                    }
                }
            }

            return totalVectors;
        }

        if (limit !== null && this.values.length > limit) {
            return this.values.slice(0, limit);
        }

        return this.values;
    }

    /**
     * depth first search
     * @param {*} topLeftFrontVector 
     * @param {*} bottomRightBackVector 
     * @param {*} limit limit the returned array size
     * @returns array
     */
    getVectorsIterative(topLeftFrontVector, bottomRightBackVector, limit = null) {
        let stack = [];
        stack.push(this);

        let totalVectors = [];

        while (stack.length !== 0) {
            const currentNode = stack.pop(); // dfs
            // const currentNode = stack.shift(); // bfs

            if (currentNode.isCubeIntersecting(topLeftFrontVector, bottomRightBackVector, currentNode.topLeftFront, currentNode.bottomRightBack)) {
                if (currentNode.isSubdivided) {
                    for (let i = 0; i < currentNode.children.length; i++) {
                        const currentChild = currentNode.children[i];
                        if (currentChild !== null) {
                            stack.push(currentChild);
                        }
                    }
                }
                else {
                    totalVectors = [...totalVectors, ...currentNode.values];

                    if (limit !== null && totalVectors.length > limit) {
                        totalVectors.splice(0, limit);
                        return totalVectors;
                    }
                }
            }
        }

        return totalVectors;
    }

    countVectors() {
        if (this.isSubdivided) {
            let total = 0;

            for (let i = 0; i < this.children.length; i++) {
                const currentChild = this.children[i];
                if (currentChild !== null) {
                    total += currentChild.countVectors();
                }
            }

            return total;
        }

        return this.values.length;
    }

    countVectorsIterative(limit = null) {
        let stack = [];
        stack.push(this);

        let total = 0;

        while (stack.length !== 0) {
            const currentNode = stack.pop(); // dfs
            // const currentNode = stack.shift(); // bfs

            total += currentNode.values.length;

            if (limit !== null && total >= limit) {
                return total;
            }

            if (currentNode.isSubdivided) {
                for (let i = 0; i < currentNode.children.length; i++) {
                    const currentChild = currentNode.children[i];
                    if (currentChild !== null) {
                        stack.push(currentChild);
                    }
                }
            }
        }

        return total;
    }

    delete(vector) {
        if (!this.isPointInCube(vector, this.topLeftFront, this.bottomRightBack)) {
            return;
        }

        // the node has values
        if (!this.isSubdivided) {
            const index = this.values.indexOf(vector);

            if (index !== -1) {
                this.values.splice(index, 1);
            }

            return;
        }

        const {
            position,
            middleX,
            middleY,
            middleZ
        } = this.getChildIndex(vector);

        const currentChild = this.children[position];

        // the child node is holding a value or has children
        if (currentChild !== null) {
            currentChild.delete(vector);

            // delete empty child nodes
            if (!currentChild.isNotEmpty()) {
                this.children[position] = null;
            }

            if (!this.isNotEmpty()) {
                this.isSubdivided = false;
            }
            else {
                // reorder tree
                if (this.countVectorsIterative(this.startingLimit + 1) <= this.startingLimit) {
                    this.values = this.getAllVectors();
                    this.isSubdivided = false;

                    for (let i = 0; i < this.children.length; i++) {
                        this.children[i] = null;
                    }
                }
            }
        }
    }
}
