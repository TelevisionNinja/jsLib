const whitespaceChars = new Set([
    '\n',
    '\r',
    '\t',
    ' ',
    '\v',
    '\f'
]);

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
 * trims a specified character from the left side of a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimChar char that will be trimed off of the str
 * @returns 
 */
export function trimCharLeft(str, trimChar) {
    let start = 0;
    const len = str.length;

    while (start < len) {
        if (str[start] != trimChar) {
            return str.substring(start);
        }

        ++start;
    }

    return '';
}

/**
 * trims a specified character from the right side of a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimChar char that will be trimed off of the str
 * @returns 
 */
export function trimCharRight(str, trimChar) {
    let end = str.length;

    while (end) {
        --end;

        if (str[end] != trimChar) {
            return str.substring(0, end + 1);
        }
    }

    return '';
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
            end = strIndex;
            substrIndex = substrLen;
        }
    }

    if (!end) {
        return '';
    }

    let start = 0;
    strIndex = 0;
    substrIndex = 0;
    while (str[strIndex] == trimSubstr[substrIndex]) {
        ++strIndex;
        ++substrIndex;

        if (substrIndex == substrLen) {
            start = strIndex;
            substrIndex = 0;
        }
    }

    return str.substring(start, end);
}

/**
 * trims a substring from the left side of a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimSubstr substring that will be trimed off of the str
 * @returns 
 */
export function trimSubstrLeft(str, trimSubstr) {
    const substrLen = trimSubstr.length,
        len = str.length;

    if (!substrLen || len < substrLen) {
        return str;
    }

    let start = 0,
        strIndex = 0,
        substrIndex = 0;
    while (start < len) {
        if (str[strIndex] != trimSubstr[substrIndex]) {
            return str.substring(start);
        }

        ++strIndex;
        ++substrIndex;

        if (substrIndex == substrLen) {
            start = strIndex;
            substrIndex = 0;
        }
    }

    return '';
}

/**
 * trims a substring from the right side of a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} trimSubstr substring that will be trimed off of the str
 * @returns 
 */
export function trimSubstrRight(str, trimSubstr) {
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
            return str.substring(0, end);
        }

        if (!substrIndex) {
            end = strIndex;
            substrIndex = substrLen;
        }
    }

    return '';
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
        if (whitespaceChars.has(str[i])) {
            isSpace = true;
        }
        else if (isSpace) {
            isSpace = false;

            if (i == limit || whitespaceChars.has(str[i + substrLen])) {
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
 * trims a set of characters from a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} charSet chars that will be trimed off of the str
 * @returns 
 */
export function trimCharSet(str, charSet) {
    let end = str.length;

    while (end) {
        --end;
 
        if (!charSet.has(str[end])) {
            ++end;
            break;
        }
    }

    if (!end) {
        return '';
    }

    let start = 0;

    while (charSet.has(str[start])) {
        ++start;
    }

    return str.substring(start, end);
}

/**
 * trims a set of characters from the left side of a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} charSet chars that will be trimed off of the str
 * @returns 
 */
export function trimCharSetLeft(str, charSet) {
    let start = 0;
    const len = str.length;

    while (start < len) {
        if (!charSet.has(str[start])) {
            return str.substring(start);
        }

        ++start;
    }

    return '';
}

/**
 * trims a set of characters from the right side of a string
 * 
 * @param {*} str str to be trimmmed
 * @param {*} charSet chars that will be trimed off of the str
 * @returns 
 */
export function trimCharSetRight(str, charSet) {
    let end = str.length;

    while (end) {
        --end;

        if (!charSet.has(str[end])) {
            return str.substring(0, end + 1);
        }
    }

    return '';
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

    if (!substrsLen || !substrArr[substrsLen - 1].length) {
        return str;
    }

    let end = str.length,
        i = 0;

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
                i = 0;
            }
            else {
                i++;
            }
        }
        else {
            i++;
        }
    }

    if (!end) {
        return "";
    }

    let start = 0,
        len = end;

    i = 0;

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

    return str.substring(start, end);
}

/**
 * trims a list of substrings from the left side of a string
 * 
 * @param {*} str 
 * @param {*} substrArr substrings that will be trimed off of the str, must be sorted from longest to shortest
 * @returns 
 */
export function trimSubstrArrLeft(str, substrArr) {
    const substrsLen = substrArr.length;

    if (!substrsLen || !substrArr[substrsLen - 1].length) {
        return str;
    }

    const end = str.length;
    let start = 0,
        len = end,
        i = 0;

    while (i < substrsLen) {
        const substr = substrArr[i];
        const substrLen = substr.length;

        i++;

        if (substrLen <= len) {
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

    return str.substring(start);
}

/**
 * trims a list of substrings from the right side of a string
 * 
 * @param {*} str 
 * @param {*} substrArr substrings that will be trimed off of the str, must be sorted from longest to shortest
 * @returns 
 */
export function trimSubstrArrRight(str, substrArr) {
    const substrsLen = substrArr.length;

    if (!substrsLen || !substrArr[substrsLen - 1].length) {
        return str;
    }

    let end = str.length,
        i = 0;

    while (i < substrsLen) {
        const  substr = substrArr[i];
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
                i = 0;
            }
            else {
                i++;
            }
        }
        else {
            i++;
        }
    }

    return str.substring(0, end);
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
export function toProperCase(str) {
    let proper = '';
    let isSpace = true;
    const n = str.length;
    let i = 0;

    while (i < n) {
        let c = str[i];

        if (whitespaceChars.has(c)) {
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

/**
 * 
 * @param {*} str1
 * @param {*} str2
 * @returns
 * 		combined str of 2 strings that are alternated w/ each other
 */
export function alternateStrings(str1, str2) {
    const str1Len = str1.length,
        str2Len = str2.length;
    let alternate = "";
    let x = 0,
        length;

    if (str1Len > str2Len) {
        length = str2Len;
    }
    else {
        length = str1Len;
    }

    //----------------------------

    while (x < length) {
        alternate += str1[x];
        alternate += str2[x];
        x++;
    }

    if (x < str1Len) {
        alternate += str1.substring(x);
    }
    else {
        alternate += str2.substring(x);
    }

    // while (x < str1Len) {
    //     alternate += str1[x];
    //     x++;
    // }

    // while (x < str2Len) {
    //     alternate += str2[x];
    //     x++;
    // }

    return alternate;
}

/**
 * finds the first instance of the substring
 * 
 * this implementation jumps to the second occurance of the substring's first char when a comparison failed in the substring comparison loop
 * 
 * @param {*} str 
 * @param {*} substr 
 * @param {*} index starting index
 * @param {*} includeOverlap 
 * @returns index of the substring, returns an empty vector if not found
 */
export function indexOfAll(str, substr, index = 0, includeOverlap = true) {
    let finds = [];

    if (index < 0) {
        return finds;
    }

    const substrLen = substr.length;

    if (!substrLen) {
        finds.push(0);
        return finds;
    }

    const firstChar = substr[0];
    let i = index;
    const strLen = str.length - substrLen;

    while (i <= strLen) {
        if (str[i] == firstChar) {
            let j = 1,
                indexSkip = 0;

            while (j < substrLen) {
                const compareChar = str[i + j];

                if (!indexSkip && compareChar == firstChar) {
                    indexSkip = j;
                }

                if (compareChar == substr[j]) {
                    j++;
                }
                else {
                    if (!indexSkip) {
                        i += j + 1;
                    }
                    else {
                        i += indexSkip;
                    }

                    break;
                }
            }

            if (j == substrLen) {
                finds.push(i);

                if (includeOverlap) {
                    i++;
                }
                else {
                    i += substrLen;
                }
            }
        }
        else {
            i++;
        }
    }

    return finds;
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} separator tag separator
 * @param {*} whitespace whitespace replacement
 * @returns 
 */
export function tagArrToStr(tagArr, separator, whitespace = ' ') {
    return tagArrToParsedTagArr(tagArr, whitespace).join(encodeURIComponent(separator));
}

/**
 * 
 * @param {*} tagArr array of tags
 * @param {*} whitespace whitespace replacement
 * @returns 
 */
export function tagArrToParsedTagArr(tagArr, whitespace = ' ') {
    if (whitespace === ' ') {
        for (let i = 0, n = tagArr.length; i < n; i++) {
            tagArr[i] = encodeURIComponent(tagArr[i].trim());
        }
    }
    else {
        for (let i = 0, n = tagArr.length; i < n; i++) {
            tagArr[i] = encodeURIComponent(tagArr[i].trim().replaceAll(' ', whitespace));
        }
    }

    return tagArr;
}
