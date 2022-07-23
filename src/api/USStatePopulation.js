import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';

const queuePopulation = new PQueue({
    interval: 1000,
    intervalCap: 100
});

/**
 * creates a url to get population data
 * 
 * @param {*} yearOffset 
 * @returns url string
 */
function getPopulationURL(yearOffset) {
    let dateObj = new Date();

    dateObj.setUTCFullYear(dateObj.getUTCFullYear() - yearOffset);

    return `https://api.census.gov/data/${dateObj.getUTCFullYear()}/pep/population?get=NAME,POP&for=state:*`;
}

/**
 * 
 * @param {*} yearOffset 
 * @param {*} recursion 
 * @returns array
 */
export async function getPopulationData(yearOffset = 1, recursion = 1) {
    let results = [];

    // limit recursion
    if (recursion === 5) {
        return results;
    }

    await queuePopulation.add(async () => {
        const response = await fetch(getPopulationURL(yearOffset));

        if (backOffFetch(response, queuePopulation)) {
            return;
        }

        if (response.status === 404 || response.status === 400) {
            results = await getPopulationData(yearOffset + 1, recursion + 1);
        }
        else {
            results = await response.json();
        }
    });

    return results;
}

/**
 * 
 * @param {*} state 
 * @param {*} data use getPopulationData()
 * @returns -1 if no data is found
 */
export function extractStatePopulation(state, data) {
    let result = -1;
    state = state.toLowerCase();

    for (let i = 1, n = data.length; i < n; i++) {
        const current = data[i];

        if (current[0].toLowerCase().startsWith(state)) {
            result = parseInt(current[1]);
            break;
        }
    }

    return result;
}

/**
 * 
 * @param {*} state state
 * @returns number
 */
export async function getPopulation(state) {
    return extractStatePopulation(state, await getPopulationData());
}
