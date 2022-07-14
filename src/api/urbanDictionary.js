import { randomMath } from '../randomFunctions.js';
import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';

const api = 'https://api.urbandictionary.com/v0/define?term=';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * 
 * @param {*} term 
 * @returns 
 */
export async function getDefinition(term) {
    let result = undefined;
    let count = 0;
    const URL = `${api}${encodeURIComponent(term)}`;

    await queue.add(async () => {
        const response = await fetch(URL);

        if (backOffFetch(response, queue)) {
            return;
        }

        const defs = (await response.json()).list;
        count = defs.length;

        if (count) {
            result = defs[randomMath(count)];
        }
    });

    return {
        result,
        count
    };
}
