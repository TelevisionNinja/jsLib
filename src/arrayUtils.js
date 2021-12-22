/**
 * returns a boolean for whether the main array constains a subset that is in the same order as the sub array
 * 
 * @param {*} arr 
 * @param {*} subArr 
 * @returns 
 */
export function hasSubArrInOrder(arr, subArr) {
    const subArrLen = subArr.length;

    // empty set
    if (subArrLen === 0) {
        return true;
    }

    const firstElement = subArr[0];
    let i = 0;
    const arrLen = arr.length - subArrLen;

    while (i <= arrLen) {
        if (arr[i] === firstElement) {
            let j = 1,
                indexSkip = 0;

            while (j < subArrLen) {
                const compareElement = arr[i + j];

                if (indexSkip === 0 && compareElement === firstElement) {
                    indexSkip = j;
                }

                if (compareElement === subArr[j]) {
                    j++;
                }
                else {
                    if (indexSkip === 0) {
                        i += j + 1;
                    }
                    else {
                        i += indexSkip;
                    }

                    break;
                }
            }

            if (j === subArrLen) {
                return true;
            }
        }
        else {
            i++;
        }
    }

    return false;
}

/**
 * returns a boolean for whether the sub array is a subset of the main array
 * 
 * uses a set
 * 
 * @param {*} arr 
 * @param {*} subArr 
 * @returns 
 */
export function hasSubArr1(arr, subArr) {
    const elementMap = new Set(arr);

    for (let i = 0, n = subArr.length; i < n; i++) {
        if (!elementMap.has(subArr[i])) {
            return false;
        }
    }

    return true;
}

/**
 * returns a boolean for whether the sub array is a subset of the main array
 * 
 * uses loops
 * 
 * @param {*} arr 
 * @param {*} subArr 
 * @returns 
 */
export function hasSubArr2(arr, subArr) {
    const arrLen = arr.size(),
        subArrLen = subArr.size();

    for (let i = 0; i < subArrLen; i++) {
        const element = subArr[i];
        let j = 0;

        while (j < arrLen && element !== arr[j]) {
            j++;
        }

        if (j === arrLen) {
            return false;
        }
    }

    return true;
}
