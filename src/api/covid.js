import fetch from 'node-fetch';
import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';

export default {
    getTestDataObj,
    getVaccineDataObj,
    getPopulation
}

const noResultsMsg = 'No results';

const queueTests = new PQueue({
    interval: 1000,
    intervalCap: 100
});

const queueVaccines = new PQueue({
    interval: 1000,
    intervalCap: 50
});

const queuePopulation = new PQueue({
    interval: 1000,
    intervalCap: 100
});

/**
 * 
 * @param {*} state 
 * @param {*} csvStr 
 * @returns 
 */
function getStateDataLine(state, csvStr) {
    const states = csvStr.split('\n');

    state = state.toLowerCase();

    let stateData = '';

    for (let i = 1, n = states.length; i < n; i++) {
        if (states[i].toLowerCase().includes(state)) {
            stateData = states[i];
            break;
        }
    }

    return stateData;
}

//---------------------------------------------------------------

/**
 * creates a url to get covid data
 * 
 * @param {*} nthDayAgo 
 * @returns url string
 */
function getTestURL(nthDayAgo) {
    let dateObj = new Date();

    dateObj.setUTCDate(dateObj.getUTCDate() - nthDayAgo);

    const month = dateObj.getUTCMonth() + 1;
    let monthStr = `${month}`;

    if (month < 10) {
        monthStr = `0${monthStr}`;
    }

    const day = dateObj.getUTCDate();
    let dayStr = `${day}`;

    if (day < 10) {
        dayStr = `0${dayStr}`;
    }

    return `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/${monthStr}-${dayStr}-${dateObj.getUTCFullYear()}.csv`;
}

/**
 * returns a csv of the latest us state covid data
 * 
 * @param {*} nthDay 
 * @returns csv string
 */
export async function getTestData(nthDay = 0) {
    let results = '';

    // limit recursion
    if (nthDay === 5) {
        return results;
    }

    await queueTests.add(async () => {
        const response = await fetch(getTestURL(nthDay));

        if (backOffFetch(response, queueTests)) {
            return;
        }

        if (response.status === 404) {
            results = await getTestData(nthDay + 1);
        }
        else {
            results = await response.text();
        }
    });

    return results;
}

/**
 * gets a states data from the csv
 * 
 * @param {*} stateData use getStateDataLine()
 * @param {*} precision 
 * @returns 
 */
function extractStateTestData(stateData, precision = 2) {
    let stateName = '';
    let lastUpdate = '';
    let confirmed = 0;
    let deaths = 0;
    let recovered = 0;
    let active = 0;

    // per 100,000 people
    let incidenceRate = 0.0;

    let totalTestResults = 0;
    let fatalityRatio = 0.0;

    // per 100,000 people
    let testingPercentage = 0.0;

    let source = '';

    let stateFound = false;

    if (stateData.length) {
        stateFound = true;
    }
    else {
        return {
            stateFound,
            stateName,
            lastUpdate,
            confirmed,
            deaths,
            recovered,
            active,
            incidenceRate,
            totalTestResults,
            fatalityRatio,
            testingPercentage,
            source
        };
    }

    const dataArr = stateData.split(',');

    stateName = dataArr[0];
    lastUpdate = dataArr[2].split(' ').join(' at ');
    confirmed = parseInt(dataArr[5]);
    deaths = parseInt(dataArr[6]);
    recovered = parseInt(dataArr[7]);
    active = parseInt(dataArr[8]);

    // per 100,000 people
    incidenceRate = (parseFloat(dataArr[10]) / 1000).toFixed(precision);

    totalTestResults = parseInt(dataArr[11]);
    fatalityRatio = parseFloat(dataArr[13]).toFixed(precision);

    // per 100,000 people
    testingPercentage = (parseFloat(dataArr[16]) / 1000).toFixed(precision);

    source = 'Data from Johns Hopkins University';

    return {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        recovered,
        active,
        incidenceRate,
        totalTestResults,
        fatalityRatio,
        testingPercentage,
        source
    };
}

/**
 * puts a state's data into a string array
 * 
 * @param {*} data use extractStateTestData()
 * @returns 
 */
export function testDataToStrArr(data) {
    const {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        recovered,
        active,
        incidenceRate,
        totalTestResults,
        fatalityRatio,
        testingPercentage,
        source
    } = data;

    let stringArr = [];

    if (!stateFound) {
        return stringArr;
    }

    stringArr.push(stateName);
    stringArr.push(`Last Update: ${lastUpdate} UTC`);
    stringArr.push(`Confirmed Cases: ${confirmed}`);
    stringArr.push(`Deaths: ${deaths}`);
    stringArr.push(`Recoveries: ${recovered}`);
    stringArr.push(`Active Cases: ${active}`);
    stringArr.push(`Incidence Rate: ${incidenceRate}%`);
    stringArr.push(`Total Tests: ${totalTestResults}`);
    stringArr.push(`Fatality: ${fatalityRatio}%`);
    stringArr.push(`Population Tested: ${testingPercentage}%`);
    stringArr.push(source);

    return stringArr;
}

/**
 * puts a state's data into an embed
 * 
 * @param {*} data use extractStateTestData()
 * @returns 
 */
export function createTestEmbed(data) {
    const {
        stateFound,
        stateName,
        lastUpdate,
        confirmed,
        deaths,
        // recovered,
        // active,
        incidenceRate,
        totalTestResults,
        fatalityRatio,
        testingPercentage,
        source
    } = data;

    if (stateFound) {
        return {
            title: `${stateName} Cases`,
            description: `Last updated on ${lastUpdate} UTC`,
            footer: { text: source },
            fields: [
                {
                    name: 'Confirmed Cases',
                    value: `${confirmed}`,
                    inline: true
                },
                {
                    name: 'Deaths',
                    value: `${deaths}`,
                    inline: true
                },
                // {
                //     name: 'Recoveries',
                //     value: recovered,
                //     inline: true
                // },
                // {
                //     name: 'Active Cases',
                //     value: active,
                //     inline: true
                // },
                {
                    name: 'Incidence Rate',
                    value: `${incidenceRate}%`,
                    inline: true
                },
                {
                    name: 'Total Tests',
                    value: `${totalTestResults}`,
                    inline: true
                },
                {
                    name: 'Fatality Percentage',
                    value: `${fatalityRatio}%`,
                    inline: true
                },
                {
                    name: 'Population Tested',
                    value: `${testingPercentage}%`,
                    inline: true
                }
            ]
        };
    }

    return {
        title: noResultsMsg
    };
}

//---------------------------------------------------------------

/**
 * 
 * @returns csv string
 */
export async function getVaccineData() {
    let results = '';

    await queueVaccines.add(async () => {
        const response = await fetch('https://raw.githubusercontent.com/govex/COVID-19/master/data_tables/vaccine_data/us_data/hourly/vaccine_people_vaccinated_US.csv');

        if (backOffFetch(response, queueVaccines)) {
            return;
        }

        results = await response.text();
    });

    return results;
}

/**
 * gets a states data from the csv
 * 
 * @param {*} stateData use getStateDataLine()
 * @returns 
 */
function extractStateVaccineData(stateData) {
    let stateName = '';
    let lastUpdate = '';
    let fullyVaccinated = 0;
    let partiallyVaccinated = 0;
    let totalVaccinated = 0;

    let source = '';

    let stateFound = false;

    if (stateData.length) {
        stateFound = true;
    }
    else {
        return {
            stateFound,
            stateName,
            lastUpdate,
            fullyVaccinated,
            partiallyVaccinated,
            totalVaccinated,
            source
        };
    }

    const dataArr = stateData.split(',');

    stateName = dataArr[1];
    lastUpdate = dataArr[3];
    fullyVaccinated = parseInt(dataArr[8]);
    partiallyVaccinated = parseInt(dataArr[9]);
    totalVaccinated = fullyVaccinated + partiallyVaccinated;

    source = 'Data from Johns Hopkins University';

    return {
        stateFound,
        stateName,
        lastUpdate,
        fullyVaccinated,
        partiallyVaccinated,
        totalVaccinated,
        source
    };
}

/**
 * puts a state's data into an embed
 * 
 * @param {*} data use extractStateVaccineData()
 * @returns 
 */
export function createVaccineEmbed(data) {
    const {
        stateFound,
        stateName,
        lastUpdate,
        fullyVaccinated,
        partiallyVaccinated,
        totalVaccinated,
        source
    } = data;

    if (stateFound) {
        return {
            title: `${stateName} Vaccinations`,
            description: `Last updated on ${lastUpdate}`,
            footer: { text: source },
            fields: [
                {
                    name: 'Fully Vaccinated',
                    value: `${fullyVaccinated}`,
                    inline: true
                },
                {
                    name: 'Partially Vaccinated',
                    value: `${partiallyVaccinated}`,
                    inline: true
                },
                {
                    name: 'Vaccinated Total',
                    value: `${totalVaccinated}`,
                    inline: true
                }
            ]
        };
    }

    return {
        title: noResultsMsg
    };
}

//---------------------------------------------------------------

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
 * @returns array
 */
export async function getPopulationData(yearOffset = 1) {
    let results = '';

    // limit recursion
    if (yearOffset === 5) {
        return results;
    }

    await queuePopulation.add(async () => {
        const response = await fetch(getPopulationURL(yearOffset));

        if (backOffFetch(response, queuePopulation)) {
            return;
        }

        if (response.status === 404 || response.status === 400) {
            results = await getPopulationData(yearOffset + 1);
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
export function getStatePopulation(state, data) {
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

//---------------------------------------------------------------

/**
 * 
 * @param {*} state 
 * @param {*} precision 
 * @returns embed array
 */
export async function getDataEmbeds(state, precision = 2) {
    const response = await Promise.all([
        getTestData(),
        getVaccineData(),
        getPopulationData()
    ]);

    const testData = response[0];
    const vaccineData = response[1];
    const populationData = response[2];

    if (testData.length) {
        let embeds = [
            createTestEmbed(extractStateTestData(getStateDataLine(state, testData), precision))
        ];
        const vaccineStateData = extractStateVaccineData(getStateDataLine(state, vaccineData));
        let vaccineEmbed = createVaccineEmbed(vaccineStateData);

        if (typeof vaccineEmbed.description !== 'undefined') {
            if (populationData.length) {
                const population = getStatePopulation(state, populationData);
    
                if (population !== -1) {
                    vaccineEmbed.fields = [
                        ...vaccineEmbed.fields,
                        {
                            name: 'Population Estimate',
                            value: `${population}`,
                            inline: true
                        },
                        {
                            name: 'Vaccinated Percentage',
                            value: `${(vaccineStateData.totalVaccinated / population * 100).toFixed(precision)}%`,
                            inline: true
                        }
                    ];
    
                    vaccineEmbed.footer.text = `${vaccineEmbed.footer.text} & US Census Bureau`;
                }
            }

            embeds.push(vaccineEmbed);
        }

        return embeds;
    }

    return [];
}

/**
 * 
 * @param {*} state 
 * @param {*} precision 
 * @returns embed object
 */
export async function getCombinedEmbed(state, precision = 2) {
    const response = await Promise.all([
        getTestData(),
        getVaccineData(),
        getPopulationData()
    ]);

    const {
        stateFound,
        confirmed,
        deaths,
        // recovered,
        // active,
        incidenceRate,
        totalTestResults,
        fatalityRatio,
        testingPercentage,
        source
    } = extractStateTestData(getStateDataLine(state, response[0]), precision);

    if (stateFound) {
        const {
            stateName,
            lastUpdate,
            fullyVaccinated,
            partiallyVaccinated,
            totalVaccinated
        } = extractStateVaccineData(getStateDataLine(state, response[1]));
        const population = getStatePopulation(state, response[2]);

        return {
            title: `${stateName}`,
            description: `Last updated on ${lastUpdate}`,
            footer: { text: `${source} & US Census Bureau`},
            fields: [
                {
                    name: 'Confirmed Cases',
                    value: `${confirmed}`,
                    inline: true
                },
                {
                    name: 'Deaths',
                    value: `${deaths}`,
                    inline: true
                },
                // {
                //     name: 'Recoveries',
                //     value: recovered,
                //     inline: true
                // },
                // {
                //     name: 'Active Cases',
                //     value: active,
                //     inline: true
                // },
                {
                    name: 'Incidence Rate',
                    value: `${incidenceRate}%`,
                    inline: true
                },
                {
                    name: 'Total Tests',
                    value: `${totalTestResults}`,
                    inline: true
                },
                {
                    name: 'Fatality Percentage',
                    value: `${fatalityRatio}%`,
                    inline: true
                },
                {
                    name: 'Population Tested',
                    value: `${testingPercentage}%`,
                    inline: true
                },
                {
                    name: 'Fully Vaccinated',
                    value: `${fullyVaccinated}`,
                    inline: true
                },
                {
                    name: 'Partially Vaccinated',
                    value: `${partiallyVaccinated}`,
                    inline: true
                },
                {
                    name: 'Vaccinated Total',
                    value: `${totalVaccinated}`,
                    inline: true
                },
                {
                    name: 'Population Estimate',
                    value: `${population}`,
                    inline: true
                },
                {
                    name: 'Vaccinated Percentage',
                    value: `${(totalVaccinated / population * 100).toFixed(precision)}%`,
                    inline: true
                }
            ]
        };
    }

    return {
        title: noResultsMsg
    };
}

//---------------------------------------------------------------

/**
 * 
 * @param {*} state state
 * @param {*} precision number of digits after the decimal point
 * @returns data object
 */
export async function getTestDataObj(state, precision = 2) {
    return extractStateTestData(getStateDataLine(state, await getTestData()), precision);
}

/**
 * 
 * @param {*} state state
 * @returns data object
 */
export async function getVaccineDataObj(state) {
    return extractStateVaccineData(getStateDataLine(state, await getVaccineData()));
}

/**
 * 
 * @param {*} state state
 * @returns number
 */
export async function getPopulation(state) {
    return getStatePopulation(state, await getPopulationData());
}
