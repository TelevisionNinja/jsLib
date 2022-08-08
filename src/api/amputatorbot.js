import PQueue from 'p-queue';
import {
    backOffFetch,
    extractAmpUrls
} from '../urlUtils.js';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * 
 * @param {*} str string containing urls
 * @param {*} guessAndCheck 
 * @param {*} maxDepth 
 * @returns 
 */
export async function getCanonicals(str, guessAndCheck = true, maxDepth = 3) {
    let linksQuery = [...extractAmpUrls(str).values()].join(';');
    let canonicals = [];

    await queue.add(async () => {
        const response = await fetch(`https://www.amputatorbot.com/api/v1/convert?gac=${guessAndCheck}&md=${maxDepth}&q=${linksQuery}`);

        if (backOffFetch(response, queue)) {
            return;
        }

        const linkArray = await response.json();

        for (let i = 0; i < linkArray.length; i++) {
            const linkObject = linkArray[i];

            if (linkObject.canonical !== null) {
                canonicals.push(linkObject.canonical.url)
            }
        }
    });

    return canonicals;
}
