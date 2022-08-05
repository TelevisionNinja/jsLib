import PQueue from 'p-queue';
import {
    backOffFetch,
    replaceHTMLEntities
} from '../urlUtils.js';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

export async function getFiftyFifty() {
    let title = '';
    let link = '';

    await queue.add(async () => {
        const response = await fetch('https://www.reddit.com/r/FiftyFifty/random.json');

        if (backOffFetch(response, queue)) {
            return;
        }

        const post = (await response.json())[0].data.children[0].data;

        title = post.title;
        link = replaceHTMLEntities(post.url);
    });

    return {
        title,
        link
    };
}
