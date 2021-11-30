import { cutOff } from '../stringUtils.js';
import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';
import fetch from 'node-fetch';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});
const punctuation = new Set([
    '.',
    ',',
    ':',
    '!',
    '?'
]);

function filterText(text) {
    if (text.length < 5) {
        throw 'text too short';
    }

    let filteredText = cutOff(text.trim(), 200);
    const lastChar = filteredText[filteredText.length - 1];

    if (filteredText.length < 200 && !punctuation.has(lastChar)) {
        return `${filteredText}.`;
    }

    return filteredText;
}

/**
 * 
 * @param {*} character 
 * @param {*} text 
 * @param {*} emotion 
 * @returns a url
 */
export async function getTtsUrl(character, text, emotion = 'Contextual') {
    text = filterText(text);
    let url = '';

    if (!text.length) {
        return url;
    }

    await queue.add(async () => {
        //----------------------------
        // get response

        const response = await fetch(`https://api.15.ai/app/getAudioFile5`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                character: character,
                emotion: emotion
            })
        });

        if (backOffFetch(response, queue)) {
            return;
        }

        const body = await response.json();

        // if the post request errors, a message is returned
        if (body.message) {
            return;
        }

        const fileName = body.wavNames[0];

        url = `https://cdn.15.ai/audio/${fileName}`;
    });

    return url;
}

/**
 * 
 * @param {*} url url from getTtsUrl()
 * @returns buffer
 */
export async function getTtsBuffer(url) {
    let buffer = undefined;

    await queue.add(async () => {
        //----------------------------
        // get response

        const response = await fetch(url);

        if (backOffFetch(response, queue)) {
            return;
        }

        buffer = await response.buffer();
    });

    return buffer;
}
