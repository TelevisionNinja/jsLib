import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';
import { parse } from 'csv-parse/sync';
import { randomMath } from '../randomFunctions.js';

const noResultsMsg = 'No results';

const queueCases = new PQueue({
    interval: 1000,
    intervalCap: 100
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
 * @param {*} country 
 * @param {*} parsedCSV use parseCSV()
 * @param {*} countryNameField 
 * @returns 
 */
function getCountryData(country, parsedCSV, countryNameField = 'Country') {
    country = country.toLowerCase();
    const columnNames = parsedCSV[0];
    let countryNameIndex = 0;

    for (let i = 0, n = columnNames.length; i < n; i++) {
        const name = columnNames[i];

        if (name === countryNameField) {
            countryNameIndex = i;
            break;
        }
    }

    let countryDataArray = [];

    // loop towards 1 bc the data is sorted by increasing date
    for (let i = parsedCSV.length - 1; i >= 1; i--) {
        const stateData = parsedCSV[i];

        if (stateData[countryNameIndex].toLowerCase().includes(country)) {
            countryDataArray = stateData;
            break;
        }
    }

    const countryDataMap = new Map();

    for (let i = 0, n = countryDataArray.length; i < n; i++) {
        countryDataMap.set(columnNames[i], countryDataArray[i]);
    }

    return countryDataMap;
}

//---------------------------------------------------------------

/**
 * 
 * @returns csv string
 */
export async function getCaseData() {
    let results = '';

    await queueCases.add(async () => {
        const response = await fetch('https://raw.githubusercontent.com/globaldothealth/monkeypox/main/timeseries-country-confirmed.csv');

        if (backOffFetch(response, queueCases)) {
            return;
        }

        results = await response.text();
    });

    return results;
}

/**
 * 
 * @param {Map} data use getCountryData()
 * @returns 
 */
function processCountryCaseData(data) {
    let countryName = '';
    let lastUpdate = '';
    let newCases = 0;
    let totalCases = 0;
    let source = '';
    let countryFound = false;

    if (data.size) {
        countryFound = true;
    }
    else {
        return {
            countryFound,
            countryName,
            lastUpdate,
            newCases,
            totalCases,
            source
        };
    }

    countryName = data.get('Country');
    lastUpdate = data.get('Date');
    newCases = parseInt(data.get('Cases'));
    totalCases = parseInt(data.get('Cumulative_cases'));
    source = `Global.health Monkeypox (accessed on ${new Date().toLocaleDateString('en-CA')})`;

    return {
        countryFound,
        countryName,
        lastUpdate,
        newCases,
        totalCases,
        source
    };
}

/**
 * 
 * @param {*} country 
 * @returns 
 */
export async function getEmbed(country) {
    const results = await Promise.all([
        getCaseData(),
        getRandomSymptoms()
    ]);
    const caseData = results[0];
    const symptoms = results[1];

    const {
        countryFound,
        countryName,
        lastUpdate,
        newCases,
        totalCases,
        source
    } = processCountryCaseData(getCountryData(country, parseCSV(caseData)));

    if (countryFound) {
        return {
            title: `${countryName} Cases`,
            description: `Last updated on ${lastUpdate}`,
            footer: { text: source },
            fields: [
                {
                    name: 'New Daily Cases',
                    value: `${newCases}`,
                    inline: true
                },
                {
                    name: 'Total Cases',
                    value: `${totalCases}`,
                    inline: true
                },
                {
                    name: 'Symptoms',
                    value: `${symptoms}`,
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
 * @returns json
 */
export async function getIndividualData() {
    let results = '';

    await queueCases.add(async () => {
        const response = await fetch('https://raw.githubusercontent.com/globaldothealth/monkeypox/main/latest.json');

        if (backOffFetch(response, queueCases)) {
            return;
        }

        results = await response.json();
    });

    return results;
}

/**
 * 
 * @param {*} cases 
 * @returns 
 */
export async function getRandomSymptoms(cases = null) {
    if (cases === null) {
        cases = await getIndividualData();
    }

    const symptoms = cases[randomMath(cases.length)]['Symptoms'];

    if (symptoms.length === 0) {
        return getRandomSymptoms(cases);
    }

    return symptoms;
}
