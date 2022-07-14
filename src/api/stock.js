import PQueue from 'p-queue';
import { backOffFetch } from '../urlUtils.js';

const stockAPI = 'https://finance.yahoo.com/q?s=';
const priceElement = 'Fw(b) Fz(36px) Mb(-4px) D(ib)';
const valueStr = 'value="';

const queue = new PQueue({
    interval: 1000,
    intervalCap: 50
});

/**
 * 
 * @param {*} symbol stock symbol
 * @returns price (string)
 */
export async function getStockStr(symbol) {
    let price = '';

    await queue.add(async () => {
        const response = await fetch(`${stockAPI}${encodeURIComponent(symbol)}`);

        if (backOffFetch(response, queue)) {
            return;
        }

        const str = await response.text();

        price = str.substring(str.indexOf(priceElement) + priceElement.length);
        price = price.substring(price.indexOf('>') + 1, price.indexOf('<'));
    });

    return price;
}

/**
 * 
 * @param {*} symbol stock symbol
 * @returns price (float)
 */
export async function getStock(symbol) {
    let price = 0.0;

    await queue.add(async () => {
        const response = await fetch(`${stockAPI}${encodeURIComponent(symbol)}`);

        if (backOffFetch(response, queue)) {
            return;
        }

        const str = await response.text();
        let priceStr = str.substring(str.indexOf(priceElement) + priceElement.length);

        const strtingIndex = priceStr.indexOf(valueStr) + valueStr.length;
        priceStr = priceStr.substring(strtingIndex, priceStr.indexOf('"', strtingIndex));

        price = parseFloat(priceStr);
    });

    return price;
}
