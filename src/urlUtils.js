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
const isValidURLRegex = new RegExp(/^(https?:\/\/)(\w{1,})(\.(\w{1,}))?\.(\w{2,})(\/\S{0,})?$/i);

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
const containsURLRegex = new RegExp(/\b(https?:\/\/)(\w{1,})(\.(\w{1,}))?\.(\w{2,})(\/\S{0,}|(?!\.)\b)/i);

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

/**
 * back off using axios and p-queue
 * 
 * @param {*} error axios error object
 * @param {*} queue p-queue queue object
 * @returns true if backed off, false if not
 */
export function backOffAxios(error, queue) {
    const errorCode = error.response.status;

    if ((errorCode === 429 || errorCode >= 500) && !queue.isPaused) {
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

    if ((errorCode === 429 || errorCode >= 500) && !queue.isPaused) {
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

const extractURLsRegex = new RegExp(/\b(https?:\/\/)(\w{1,})(\.(\w{1,}))?\.(\w{2,})(\/\S{0,}|(?!\.)\b)/ig);

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
                const url = response.value.request.res.responseUrl;

                if (url !== urlArray[i]) {
                    newLinks.push(url);
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
 * 
 * @param {*} urlSet set of AMP URL's
 * @returns array of non-AMP URL's
 */
export async function convertAMPSetFetch(urlSet) {
    let newLinks = [];

    const urlArray = [...urlSet];
    let responses = [];
    const n = urlSet.size;

    for (let i = 0; i < n; i++) {
        responses.push(queue.add(() => fetch(urlArray[i])));
    }

    for (let i = 0; i < n; i++) {
        const response = await responses[i];

        if (!backOffFetch(response, queue)) {
            const url = response.url;

            if (url !== urlArray[i]) {
                newLinks.push(url);
            }
        }
    }

    return newLinks;
}

const isValidAmpUrlRegex = new RegExp(/^(https?:\/\/)(\w{1,}\.)?google\.(\w{2,})(\/\S{0,})?[^a-zA-Z\s]amp([^a-zA-Z\s]\S{0,}|$)/i);

/**
 * check if the link is an AMP link
 * 
 * @param {*} url 
 * @returns 
 */
export function isAMP(url) {
    return isValidAmpUrlRegex.test(url);
}

const extractAmpUrlsRegex = new RegExp(/\b(https?:\/\/)(\w{1,}\.)?google\.(\w{2,})(\/\S{0,})?[^a-zA-Z\s]amp([^a-zA-Z\s]\S{0,}|\b)/ig);

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
export async function extractAndConvertAmpLinksAxios(str) {
    const linkSet = extractAmpUrls(str);

    if (linkSet.size) {
        return [...(await convertAMPSetAxios(linkSet))];
    }

    return [];
}

/**
 * 
 * @param {*} str 
 * @returns array of non-AMP links
 */
export async function extractAndConvertAmpLinksFetch(str) {
    const linkSet = extractAmpUrls(str);

    if (linkSet.size) {
        return [...(await convertAMPSetFetch(linkSet))];
    }

    return [];
}
