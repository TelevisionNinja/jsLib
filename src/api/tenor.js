import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});
const api = `https://api.tenor.com/v1/random?&limit=1&media_filter=minimal&key=`;

/**
 * 
 * @param {*} searchTerm term to be searched
 * @param {*} apiKey api key
 * @returns url
 */
export async function getGif(searchTerm, apiKey) {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    let gif = '';

    await queue.add(async () => {
        const response = await fetch(`${api}${apiKey}&q=${encodedSearchTerm}`);

        if (backOffFetch(response, queue)) {
            return;
        }

        const gifArr = (await response.json()).results;

        if (gifArr.length) {
            gif = gifArr[0].url;
        }
    });

    return gif;
}
