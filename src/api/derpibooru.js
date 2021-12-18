import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { backOffFetch } from './urlUtils.js';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

const api = 'https://derpibooru.org/api/v1/json/search/images?per_page=1&filter_id=56027&sf=random&key=';

/**
 * Returns an image object
 * If no image is found, the results var is zero
 * 
 * @param {*} tagArr array of tags to be searched
 * @param {*} apiKey api key
 * @returns 
 */
export async function getImage(tagArr, apiKey = '') {
    // tags are separated by ','
    const tags = encodeURIComponent(tagArr.join(','));
    let imgObj = { results: 0 };

    await queue.add(async () => {
        const response = await fetch(`${api}${apiKey}&q=${tags}`);

        if (backOffFetch(response, queue)) {
            return;
        }

        const body = await response.json();
        const results = parseInt(body.total);

        if (results) {
            const img = body.images[0];

            //-----------------------------------------
            // create image object

            let artists = [];

            for (let i = 0, n = img.tags.length; i < n; i++) {
                const tag = img.tags[i];

                if (tag.startsWith('artist:')) {
                    artists.push(tag.substring(7));
                }
            }

            if (!artists.length) {
                artists.push('unknown artist');
            }

            imgObj = {
                source: `https://derpibooru.org/${img.id}`,
                url: img.representations.full,
                artist: artists,
                description: img.description,
                results: results,
            }
        }
    });

    return imgObj;
}
