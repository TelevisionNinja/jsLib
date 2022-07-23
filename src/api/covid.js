import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';
import { numberLengthFormat } from '../stringUtils.js';
import { parse } from 'csv-parse/sync';
import {
    getPopulationData,
    extractStatePopulation
} from './USStatePopulation.js';

export default {
    getTestDataObj,
    getVaccineDataObj
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

/**
 * 
 * @param {*} csv csv string
 * @returns array of array
 */
function parseCSV(csv) {
    return parse(csv, { skipEmptyLines: true });
}

/**
 * 
 * @param {*} state 
 * @param {*} parsedCSV use parseCSV()
 * @param {*} stateNameField 
 * @returns 
 */
function getStateData(state, parsedCSV, stateNameField = 'Province_State') {
    state = state.toLowerCase();
    const columnNames = parsedCSV[0];
    let stateNameIndex = 0;

    for (let i = 0, n = columnNames.length; i < n; i++) {
        const name = columnNames[i];

        if (name === stateNameField) {
            stateNameIndex = i;
            break;
        }
    }

    let stateDataArray = [];

    for (let i = 1, n = parsedCSV.length; i < n; i++) {
        const stateData = parsedCSV[i];

        if (stateData[stateNameIndex].toLowerCase().includes(state)) {
            stateDataArray = stateData;
            break;
        }
    }

    const stateDataMap = new Map();

    for (let i = 0, n = stateDataArray.length; i < n; i++) {
        stateDataMap.set(columnNames[i], stateDataArray[i]);
    }

    return stateDataMap;
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

    const month = numberLengthFormat(dateObj.getUTCMonth() + 1);
    const day = numberLengthFormat(dateObj.getUTCDate());

    return `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports_us/${month}-${day}-${dateObj.getUTCFullYear()}.csv`;
}

/**
 * returns a csv of the latest us state covid data
 * 
 * @param {*} nthDay 
 * @param {*} recursion 
 * @returns csv string
 */
export async function getTestData(nthDay = 0, recursion = 1) {
    let results = '';

    // limit recursion
    if (recursion === 5) {
        return results;
    }

    await queueTests.add(async () => {
        const response = await fetch(getTestURL(nthDay));

        if (backOffFetch(response, queueTests)) {
            return;
        }

        if (response.status === 404) {
            results = await getTestData(nthDay + 1, recursion + 1);
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
 * @param {Map} stateData use getStateData()
 * @param {*} precision 
 * @returns 
 */
function processStateTestData(stateData, precision = 2) {
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

    if (stateData.size) {
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

    stateName = stateData.get('Province_State');
    lastUpdate = stateData.get('Last_Update').split(' ').join(' at ');
    confirmed = parseInt(stateData.get('Confirmed'));
    deaths = parseInt(stateData.get('Deaths'));
    recovered = parseInt(stateData.get('Recovered'));
    active = parseInt(stateData.get('Active'));

    // per 100,000 people
    incidenceRate = (parseFloat(stateData.get('Incident_Rate')) / 1000).toFixed(precision);

    totalTestResults = parseInt(stateData.get('Total_Test_Results'));
    fatalityRatio = parseFloat(stateData.get('Case_Fatality_Ratio')).toFixed(precision);

    // per 100,000 people
    testingPercentage = (parseFloat(stateData.get('Testing_Rate')) / 1000).toFixed(precision);

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
 * @param {Map} stateData use getStateData()
 * @returns 
 */
function processStateVaccineData(stateData) {
    let stateName = '';
    let lastUpdate = '';
    let fullyVaccinated = 0;
    let partiallyVaccinated = 0;
    let totalVaccinated = 0;

    let source = '';

    let stateFound = false;

    if (stateData.size) {
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

    stateName = stateData.get('Province_State');
    lastUpdate = stateData.get('Date');
    fullyVaccinated = parseInt(stateData.get('People_Fully_Vaccinated'));
    partiallyVaccinated = parseInt(stateData.get('People_Partially_Vaccinated'));
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
            createTestEmbed(processStateTestData(getStateData(state, parseCSV(testData)), precision))
        ];
        const vaccineStateData = processStateVaccineData(getStateData(state, parseCSV(vaccineData)));
        let vaccineEmbed = createVaccineEmbed(vaccineStateData);

        if (typeof vaccineEmbed.description !== 'undefined') {
            if (populationData.length) {
                const population = extractStatePopulation(state, populationData);
    
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
    } = processStateTestData(getStateData(state, parseCSV(response[0])), precision);

    if (stateFound) {
        const {
            stateName,
            lastUpdate,
            fullyVaccinated,
            partiallyVaccinated,
            totalVaccinated
        } = processStateVaccineData(getStateData(state, parseCSV(response[1])));
        const population = extractStatePopulation(state, response[2]);

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
    return processStateTestData(getStateData(state, parseCSV(await getTestData())), precision);
}

/**
 * 
 * @param {*} state state
 * @returns data object
 */
export async function getVaccineDataObj(state) {
    return processStateVaccineData(getStateData(state, parseCSV(await getVaccineData())));
}
