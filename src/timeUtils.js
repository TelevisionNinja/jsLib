/**
 * 
 * @param {Date} date Date object
 */
export function subtractAMonth(date) {
    const current = date.getMonth();
    date.setMonth(current - 1);

    // going back to a previous month that has less days will cause the date object to still have the same month
    while (current === date.getMonth()) {
        date.setMonth(date.getMonth() - 1);
    }
}

/**
 * 
 * @param {Date} date Date object
 * @returns absolute value of daylight savings offset in mins
 */
export function getDaylightSavingsOffset(date) {
    const currentMonth = date.getMonth();
    const currentOffset = date.getTimezoneOffset();
    const compare = new Date(date);

    subtractAMonth(compare);

    do {
        const compareOffset = compare.getTimezoneOffset();

        if (currentOffset !== compareOffset) {
            return Math.abs(currentOffset - compareOffset);
        }

        subtractAMonth(compare);
    }
    while (currentMonth !== compare.getMonth());

    return 0;
}
