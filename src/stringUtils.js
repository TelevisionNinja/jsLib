/**
 * trims a specified character from a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimChar char that will be trimed off of the str
 * @returns 
 */
export function trimChar(str, trimChar) {
    let end = str.length;
    while (end) {
        --end;

        if (str[end] != trimChar) {
            ++end;
            break;
        }
    }

    if (!end) {
        return '';
    }

    let start = 0;
    while (str[start] === trimChar) {
        ++start;
    }

    return str.substring(start, end);
}

/**
 * trims a substring from a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimSubstr substring that will be trimed off of the str
 * @returns 
 */
export function trimSubstr(str, trimSubstr) {
    const substrLen = trimSubstr.length;
    let end = str.length;

    if (!substrLen || end < substrLen) {
        return str;
    }

    let strIndex = end,
        substrIndex = substrLen;
    while (strIndex) {
        --strIndex;
        --substrIndex;

        if (str[strIndex] != trimSubstr[substrIndex]) {
            break;
        }

        if (!substrIndex) {
            end = strIndex,
                substrIndex = substrLen;
        }
    }

    if (!end) {
        return '';
    }

    let start = 0;
    strIndex = 0,
        substrIndex = 0;
    while (str[strIndex] == trimSubstr[substrIndex]) {
        ++strIndex;
        ++substrIndex;

        if (substrIndex == substrLen) {
            start = strIndex,
                substrIndex = 0;
        }
    }

    return str.substring(start, end);
}

/**
 * postive = to the left
 * negative = to the right
 * 
 * @param {*} str 
 * @param {*} n 
 * @returns 
 */
export function rotate(str, n) {
    const length = str.length,
        index = ((n % length) + length) % length;

    return `${str.substring(index)}${str.substring(0, index)}`;
}

/**
 * escapes regex using regex
 * 
 * @param {*} str 
 */
export function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * reduce oversized strings
 * 
 * @param {*} str 
 * @param {*} charLimit 
 * @returns 
 */
export function cutOff(str, charLimit) {
    if (str.length > charLimit) {
        return `${str.substring(0, charLimit - 3)}...`;
    }

    return str;
}

/**
 * check if a phrase appears in a string
 * 
 * @param {*} str 
 * @param {*} phrase string with no leading or trailing whitespace
 * @param {*} caseSensitive 
 * @returns 
 */
export function includesPhrase1(str, phrase, caseSensitive) {
    if (!caseSensitive) {
        str = str.toLowerCase();
        phrase = phrase.toLowerCase();
    }

    const substrLen = phrase.length,
        limit = str.length - substrLen;

    let isSpace = true;

    for (let i = 0; i <= limit; i++) {
        if (str[i] == ' ') {
            isSpace = true;
        }
        else if (isSpace) {
            isSpace = false;

            if ((i < limit && str[i + substrLen] == ' ') || i == limit) {
                let j = 0;

                while (j < substrLen && str[i + j] == phrase[j]) {
                    j++;
                }

                if (j == substrLen) {
                    return true;
                }
            }
        }
    }

    return false;
}

/**
 * check if a phrase appears in a string
 * 
 * @param {*} str 
 * @param {*} phrase 
 * @param {*} caseSensitive 
 * @returns 
 */
export function includesPhrase2(str, phrase, caseSensitive = true) {
    const escapedWord = `\\b${escapeRegex(phrase)}\\b`;

    if (caseSensitive) {
        return new RegExp(escapedWord).test(str);
    }

    return new RegExp(escapedWord, 'i').test(str);
}

/**
 * trims a list of characters from a string
 * 
 * @param {*} str 
 * @param {*} charArr chars that will be trimed off of the str
 * @returns 
 */
export function trimCharArr(str, charArr) {
    const charsLen = charArr.length;
    end = str.length;

    while (end) {
        --end;
        const current = str[end];
        let i = 0;

        while (i < charsLen && current != charArr[i]) {
            i++;
        }

        if (i == charsLen) {
            ++end;
            break;
        }
    }

    if (!end) {
        return "";
    }

    let start = 0;

    while (true) {
        const current = str[start];
        let i = 0;

        while (i < charsLen && current != charArr[i]) {
            i++;
        }

        if (i == charsLen) {
            break;
        }

        ++start;
    }

    return str.substring(start, end);
}

/**
 * trims a list of substrings from a string
 * 
 * @param {*} str 
 * @param {*} substrArr substrings that will be trimed off of the str, must be sorted from longest to shortest
 * @returns 
 */
export function trimSubstrArr(str, substrArr) {
    const substrsLen = substrArr.length;

    /*
    reject substring arrays with empty strings, (assumes the list is not sorted by length)
    use this if statement instead of the for loop if the array will always be sorted:

    if (!substrsLen || !substrArr[0].length) {
        return str;
    }
    */
    for (let i = 0; i < substrsLen; i++) {
        if (!substrArr[i].length) {
            return str;
        }
    }

    let end = str.length;

    while (end) {
        let i = 0;

        while (i < substrsLen) {
            const substr = substrArr[i];
            let substrIndex = substr.length;

            if (substrIndex <= end) {
                let strIndex = end;

                while (substrIndex) {
                    --strIndex;
                    --substrIndex;

                    if (str[strIndex] != substr[substrIndex]) {
                        ++substrIndex;
                        break;
                    }
                }

                if (!substrIndex) {
                    end = strIndex;
                    break;
                }
            }

            i++;
        }

        if (i == substrsLen) {
            break;
        }
    }

    if (!end) {
        return "";
    }

    let start = 0,
        len = end;
    while (true) {
        let i = 0;

        while (i < substrsLen) {
            const substr = substrArr[i];
            const substrLen = substr.length;

            i++;

            if (substrLen < len) {
                let strIndex = start,
                    substrIndex = 0;

                while (str[strIndex] == substr[substrIndex]) {
                    ++strIndex;
                    ++substrIndex;

                    if (substrIndex == substrLen) {
                        start = strIndex;
                        len = end - start;
                        i = 0;
                        break;
                    }
                }
            }
        }

        if (i == substrsLen) {
            break;
        }
    }

    return str.substring(start, end);
}

/**
 * parses a command line string into an array w/o any space char elements
 * 
 * @param {*} cmdLn 
 * @param {*} throwError 
 * @returns string array
 */
export function cmdLnToArgArr(cmdLn, throwError = true) {
    let i = 0,
        startOfArg = 0;
    const len = cmdLn.length;
    let inStr = false;
    let array = [];
    let str = '';
    let previousChar = ' ';

    while (i < len) {
        const currentChar = cmdLn[i];

        // check if iteration is in a string
        if (inStr) {
            // check for and escape a char
            if (currentChar === '\\') {
                str = `${str}${cmdLn.substring(startOfArg, i)}`;
                i++;
                startOfArg = i;
            }
            // check for end of the string
            else if (currentChar === '"') {
                array.push(`${str}${cmdLn.substring(startOfArg, i)}`);

                inStr = false;
                str = '';
                startOfArg = i + 1;
            }
        }
        else {            
            // skip whitespace between args

            // start of arg
            if (previousChar === ' ') {
                if (currentChar !== ' ') {
                    startOfArg = i;
                }
            }
            // end of arg
            else if (previousChar !== '"') {
                if (currentChar === ' ' || currentChar === '"') {
                    array.push(cmdLn.substring(startOfArg, i));

                    startOfArg = len;
                }
            }

            // check for start of a string
            if (currentChar === '"') {
                inStr = true;
                startOfArg = i + 1;
            }
        }

        previousChar = currentChar;
        i++;
    }

    if (inStr) {
        if (throwError) {
            throw 'error: invalid command line';
        }
    }
    else {
        if (len - startOfArg) {
            array.push(cmdLn.substring(startOfArg));
        }
    }

    return array;
}

/**
 * capitalizes characters after spaces and lower case otherwise
 * 
 * @param {*} str 
 * @returns 
 */
export function properCase(str) {
    let proper = '';
    let isSpace = true;
    const n = str.length;
    let i = 0;

    while (i < n) {
        let c = str[i];

        if (c === ' ') {
            isSpace = true;
        }
        else if (isSpace) {
            isSpace = false;
            c = c.toUpperCase();
        }
        else {
            c = c.toLowerCase();
        }

        proper = `${proper}${c}`;
        i++;
    }

    return proper;
}
