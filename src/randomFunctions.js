import fetch from 'node-fetch';
import { randomInt } from 'crypto';
import PQueue from 'p-queue';
import { backOffFetch } from './urlUtils.js';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * 
 * @param {*} min inclusive min
 * @param {*} max 
 * @param {*} inclusive exclusive max
 * @returns 
 */
export function randomMath(min = 0, max = 0) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 
 * @param {*} min inclusive min
 * @param {*} max 
 * @param {*} inclusive exclusive max
 * @returns 
 */
export function randomCrypto(min = 0, max = 0) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    return randomInt(min, max);
}

/**
 * 
 * @param {*} min inclusive min
 * @param {*} max 
 * @param {*} inclusive incusive max
 * @param {*} base 
 * @returns 
 */
export async function randomTrue(min = 0, max = 0, base = 10) {
    if (max === min) {
        return max;
    }

    if (min > max) {
        const temp = max;
        max = min;
        min = temp;
    }

    const url = `https://www.random.org/integers/?num=1&min=${min}&max=${max}&col=1&base=${base}&format=plain&rnd=new`;
    let result = 0;

    await queue.add(async () => {
        const response = await fetch(url);

        if (backOffFetch(response, queue)) {
            return;
        }

        result = await response.json();
    });

    return result;
}
