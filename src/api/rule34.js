import { randomMath } from '../randomFunctions.js';
import {
    tagArrToStr,
    tagArrToParsedTagArr
} from '../stringUtils.js';
import { parse } from 'txml';
import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';

const config = {
    rule34: {
        URL: 'https://rule34.xxx/index.php?page=post&s=view&id=',
        API: 'https://rule34.xxx/index.php?page=dapi&s=post&q=index&tags=',
        whitespace: '_',
        separator: '+'
    },
    paheal: {
        URL: 'https://rule34.paheal.net/post/view/',
        API: 'https://rule34.paheal.net/api/danbooru/find_posts?&tags=',
        whitespace: '_',
        separator: ' '
    }
};

const queueZero = new PQueue({
    interval: 1000,
    intervalCap: 50
});
const queueOne = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * rule34.xxx
 * 
 * '-' infront of tags means to exclude the tag
 * Returns an image object
 * If no image is found, the results var is zero
 * 
 * 2 requests are made
 * 
 * @param {*} tagArr array of tags
 * @returns 
 */
export async function getImageRule34(tagArr) {
    // tags are separated by '+'
    const URL = `${config.rule34.API}${tagArrToParsedTagArr(tagArr, config.rule34.whitespace).join(config.rule34.separator)}&limit=`;
    let imgObj = { results: 0 };

    await queueZero.add(async () => {
        let response = await fetch(`${URL}0`);

        if (backOffFetch(response, queueZero)) {
            return;
        }

        let parsedXML = parse(await response.text());

        // 'count' is # of images for the provided tags
        let count = parseInt(parsedXML[1].attributes.count);

        if (count) {
            imgObj.results = count;

            // the max number of images for the rule0 api is 200001 images (0-200000)
            // the site has a max of 100 posts per request
            // pid range: zero to count / (limit per request)

            // (max # images) / (limit per request) = pid max
            // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0
            if (count > 200000) {
                count = 200000;
            }

            const pid = randomMath(count);

            response = await fetch(`${URL}1&pid=${pid}`);

            if (backOffFetch(response, queueZero)) {
                return;
            }

            parsedXML = parse(await response.text());

            // get the first image from the 'posts' array
            // elements of the array are named 'post'
            const img = parsedXML[1].children[0].attributes;

            imgObj.source = `${config.rule34.URL}${img.id}`;
            imgObj.url = img.file_url;
        }
    });

    return imgObj;
}

/**
 * paheal
 * 
 * '-' infront of tags means to exclude the tag
 * Returns an image object
 * If no image is found, the results var is zero
 * 
 * 2 requests are made
 * 
 * @param {*} tagArr array of tags
 * @returns 
 */
export async function getImagePaheal(tagArr) {
    // this api has a max of 3 tags
    if (tagArr.length > 3) {
        tagArr = tagArr.slice(0, 3);
    }

    // tags are separated by ' '
    const URL = `${config.paheal.API}${tagArrToStr(tagArr, config.paheal.separator, config.paheal.whitespace)}&limit=`;
    let imgObj = { results: 0 };

    await queueOne.add(async () => {
        let response = await fetch(`${URL}0`);

        if (backOffFetch(response, queueOne)) {
            return;
        }

        let parsedXML = parse(await response.text());

        // 'count' is # of images for the provided tags
        const count = parseInt(parsedXML[0].attributes.count);

        if (count) {
            // the site has a max of 100 posts per request
            // pid range: zero to count / (limit per request)

            // (max # images) / (limit per request) = pid max
            // ex: 200001 / 100 = a pid max of 2000 bc it starts at 0
            const pid = randomMath(count);

            response = await fetch(`${URL}1&pid=${pid}`);

            if (backOffFetch(response, queueOne)) {
                return;
            }

            parsedXML = parse(await response.text());

            // get the first image from the 'posts' array
            // elements of the array are named 'tag'
            const img = parsedXML[0].children[0].attributes;

            imgObj.source = `${config.paheal.URL}${img.id}`;
            imgObj.url = img.file_url;
            imgObj.results = count;
        }
    });

    return imgObj;
}
