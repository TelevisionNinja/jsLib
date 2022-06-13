import axios from 'axios';
import fetch from 'node-fetch';
import PQueue from 'p-queue';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * replaces html entities with their character equivalent
 * 
 * @param {*} str 
 * @returns 
 */
export function replaceHTMLEntities(str) {
    return str.replaceAll('&quot;', '"')
        .replaceAll('&#39;', '\'')
        .replaceAll('&apos;', '\'')
        .replaceAll('&amp;', '&')
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>');
}

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const isValidURLRegex = new RegExp(/^https?:\/\/([^\s\/]{1,}\.)?\w{1,}\.\w{2,}(\/\S{0,})?$/i);

/**
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 * 
 * @param {*} str 
 * @returns 
 */
export function isValidURL(str) {
    return isValidURLRegex.test(str);
}

/*
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 */
const containsURLRegex = new RegExp(/\bhttps?:\/\/([^\s\/]{1,}\.)?\w{1,}\.\w{2,}(\/\S{0,})?\b/i);

/**
 * check for a scheme of 'http' or 'https'
 * check if the top level domain is of 2 or more characters
 * 
 * @param {*} str 
 * @returns 
 */
export function containsURL(str) {
    return containsURLRegex.test(str);
}

const errorCodes = new Set([
    429
]);

/**
 * back off using axios and p-queue
 * 
 * @param {*} error axios error object
 * @param {*} queue p-queue queue object
 * @returns true if backed off, false if not
 */
export function backOffAxios(error, queue) {
    const errorCode = error.response.status;

    if ((errorCodes.has(errorCode) || errorCode >= 500) && !queue.isPaused) {
        queue.pause();

        const retryTime = error.response.headers['retry-after'];
        let time = 1;

        if (typeof retryTime !== 'undefined') {
            const parsedNum = parseInt(retryTime);

            if (parsedNum) {
                time = parsedNum * 1000;
            }
            else {
                time = (new Date(retryTime).getTime() - Date.now()) || 1000;
            }
        }

        setTimeout(() => {
            queue.clear();
            queue.start();
        }, time);

        return true;
    }

    return false;
}

/**
 * back off using node-fetch and p-queue
 * 
 * @param {*} response 
 * @param {*} queue 
 * @returns true if backed off, false if not
 */
export function backOffFetch(response, queue) {
    const errorCode = response.status;

    if ((errorCodes.has(errorCode) || errorCode >= 500) && !queue.isPaused) {
        queue.pause();

        const retryTime = response.headers.get('retry-after');
        let time = 1;

        if (typeof retryTime !== 'undefined') {
            const parsedNum = parseInt(retryTime);

            if (parsedNum) {
                time = parsedNum * 1000;
            }
            else {
                time = (new Date(retryTime).getTime() - Date.now()) || 1000;
            }
        }

        setTimeout(() => {
            queue.clear();
            queue.start();
        }, time);

        return true;
    }

    return false;
}

const extractURLsRegex = new RegExp(/\bhttps?:\/\/([^\s\/]{1,}\.)?\w{1,}\.\w{2,}(\/\S{0,})?\b/ig);

/**
 * 
 * @param {*} str 
 * @returns set of URLs
 */
export function extractURLs(str = '') {
    const URLs = new Set();
    const detectedURLs = [...str.matchAll(extractURLsRegex)];

    for (let i = 0, n = detectedURLs.length; i < n; i++) {
        URLs.add(detectedURLs[i][0]);
    }

    return URLs;
}

/**
 * don't use in a loop
 * 
 * @param {*} url AMP URL
 * @returns non-AMP URL
 */
export async function convertAMPAxios(url) {
    let newLink = url;

    await queue.add(async () => {
        try {
            const response = await axios.get(url);
            const link = response.request.res.responseUrl;

            if (newLink !== link) {
                newLink = link;
            }
        }
        catch (error) {
            backOffAxios(error, queue);
            console.log(error);
        }
    });

    return newLink;
}

/**
 * don't use in a loop
 * 
 * @param {*} url AMP URL
 * @returns non-AMP URL
 */
export async function convertAMPFetch(url) {
    let newLink = url;

    await queue.add(async () => {
        const response = await fetch(url);

        if (backOffFetch(response, queue)) {
            return;
        }

        const link = response.url;

        if (newLink !== link) {
            newLink = link;
        }
    });

    return newLink;
}

const ampSubdomain = 'amp.';
const googleRedirct = 'https://www.google.com/url?q=';
const googleAMPPath = 'https://www.google.com/amp/s';
const ampDetectRegex = new RegExp(/([^\w\s])amp([^\w\s]|\b)/i);

/**
 * 
 * @param {*} urlSet set of AMP URL's
 * @returns array of non-AMP URL's
 */
export async function convertAMPSetAxios(urlSet) {
    let newLinks = [];

    try {
        const urlArray = [...urlSet];
        let responses = [];
        const n = urlSet.size;

        for (let i = 0; i < n; i++) {
            responses.push(queue.add(() => axios.get(urlArray[i])));
        }

        responses = await Promise.allSettled(responses);

        for (let i = 0; i < n; i++) {
            const response = responses[i];

            if (response.status === 'fulfilled') {
                let newURL = response.value.request.res.responseUrl;
                let oldURL = urlArray[i];

                if (newURL.startsWith(googleRedirct)) {
                    newURL = newURL.substring(googleRedirct.length);
                }

                if (oldURL[oldURL.length - 1] === '/') {
                    oldURL = oldURL.substring(0, oldURL.length - 1);
                }

                if (newURL[newURL.length - 1] === '/') {
                    newURL = newURL.substring(0, newURL.length - 1);
                }

                if (newURL !== oldURL) {
                    newLinks.push(newURL);
                }
            }
        }
    }
    catch (error) {
        backOffAxios(error, queue);
        console.log(error);
    }

    return newLinks;
}

/**
 * construct a non-amp url
 * 
 * @param {*} startOfPath 
 * @param {*} partialURL 
 * @param {*} oldDomain 
 * @param {*} oldURL 
 * @param {*} newURL 
 * @returns 
 */
async function makeNewNonAMPURL(startOfPath, partialURL, oldDomain, oldURL, newURL) {
    const path = partialURL.substring(startOfPath);

    if (oldDomain.startsWith(ampSubdomain) && !ampDetectRegex.test(path)) {
        const response = await fetch(`https://${oldURL.substring(googleAMPPath.length + 1 + ampSubdomain.length)}`);

        if (!backOffFetch(response, queue) && response.ok) {
            return response.url;
        }
    }

    return newURL;
}

/**
 * 
 * @param {*} urlSet set of AMP URL's
 * @returns array of non-AMP URL's
 */
export async function convertAMPSetFetch(urlSet) {
    let newLinks = [];
    let middleLinks = [];
    const urlArray = [...urlSet];
    let responses = [];
    const n = urlSet.size;

    for (let i = 0; i < n; i++) {
        responses.push(queue.add(async () => {
            const response = await fetch(urlArray[i]);

            if (backOffFetch(response, queue)) {
                return '';
            }

            return response.url;
        }));
    }

    responses = await Promise.allSettled(responses);

    for (let i = 0; i < n; i++) {
        let newURL = responses[i].value;

        if (newURL.length !== 0) {
            let oldURL = urlArray[i];

            if (newURL.startsWith(googleRedirct)) {
                newURL = newURL.substring(googleRedirct.length);
            }
            else {
                const partialURL = oldURL.substring(googleAMPPath.length + 1);
                const startOfPath = partialURL.indexOf('/');
                const oldDomain = partialURL.substring(0, startOfPath);
                const newDomain = extractDomain(newURL);
                const oldDomainParts = oldDomain.split('.');
                const newDomainParts = newDomain.split('.');

                if (oldDomainParts.length !== newDomainParts.length) {
                    newURL = makeNewNonAMPURL(startOfPath, partialURL, oldDomain, oldURL, newURL);
                }
                else {
                    for (let j = oldDomainParts.length - 1; j >= 0; j--) {
                        if (oldDomainParts[j] !== newDomainParts[j]) {
                            newURL = makeNewNonAMPURL(startOfPath, partialURL, oldDomain, oldURL, newURL);
                            break;
                        }
                    }
                }
            }

            middleLinks.push(newURL);
        }
    }

    middleLinks = await Promise.allSettled(middleLinks);

    for (let i = 0, linksLen = middleLinks.length; i < linksLen; i++) {
        let newURL = middleLinks[i].value;
        let oldURL = urlArray[i];

        //---------------------------
        // remove forward slashs

        if (oldURL[oldURL.length - 1] === '/') {
            oldURL = oldURL.substring(0, oldURL.length - 1);
        }

        if (newURL[newURL.length - 1] === '/') {
            newURL = newURL.substring(0, newURL.length - 1);
        }

        //---------------------------

        if (newURL !== oldURL) {
            newLinks.push(newURL);
        }
    }

    return newLinks;
}

const isValidAmpUrlRegex = new RegExp(/^https?:\/\/((([^\s\/]{1,}[^\w\s\/])?amp\.([^\s\/]{1,}\.)?\w{1,}\.\w{2,}(\/\S{0,})?)|(([^\s\/]{1,}\.)?\w{1,}\.\w{2,}\/(\S{0,}[^\w\s])?amp\S{0,}))$/i);

/**
 * check if the link is an AMP link
 * 
 * @param {*} url 
 * @returns 
 */
export function isAMP(url) {
    return isValidAmpUrlRegex.test(url);
}

const extractAmpUrlsRegex = new RegExp(/\bhttps?:\/\/((([^\s\/]{1,}[^\w\s\/])?amp\.([^\s\/]{1,}\.)?\w{1,}\.\w{2,}(\/\S{0,})?)|(([^\s\/]{1,}\.)?\w{1,}\.\w{2,}\/(\S{0,}[^\w\s])?amp\S{0,}))\b/ig);

/**
 * 
 * @param {*} str 
 * @returns set of URLs
 */
export function extractAmpUrls(str) {
    const links = [...str.matchAll(extractAmpUrlsRegex)].map(e => e[0]);
    return new Set(links);
}

/**
 * 
 * @param {*} str 
 * @returns array of non-AMP links
 */
export function extractAndConvertAmpLinksAxios(str) {
    const linkSet = extractAmpUrls(str);

    if (linkSet.size) {
        return convertAMPSetAxios(linkSet);
    }

    return [];
}

/**
 * 
 * @param {*} str 
 * @returns array of non-AMP links
 */
export function extractAndConvertAmpLinksFetch(str) {
    const linkSet = extractAmpUrls(str);

    if (linkSet.size) {
        return convertAMPSetFetch(linkSet);
    }

    return [];
}

const extractDomainRegex = new RegExp(/([^\s\/]{1,}\.)?[^\s\/]{1,}\.[^\s\/]{2,}/i);

/**
 * 
 * @param {*} url 
 * @returns ex: www.example.com
 */
export function extractDomain(url) {
    return url.match(extractDomainRegex)[0];
}
