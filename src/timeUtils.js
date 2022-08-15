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
export function dateGetDaylightSavingsOffset(date) {
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

/**
 * 
 * @param {Temporal.ZonedDateTime} date Temporal zonedDateTime object
 * @returns absolute value of daylight savings offset in ns
 */
export function temporalGetDaylightSavingsOffset(date) {
    const shiftDay = date.timeZone.getPreviousTransition(date);

    if (shiftDay === null) {
        return 0;
    }

    const shiftDayZonedDate = shiftDay.toZonedDateTime({
        calendar: date.calendar,
        timeZone: date.timeZone
    });

    const previousOffest = shiftDayZonedDate.subtract({
        nanoseconds: 1
    }).offsetNanoseconds;

    const nextOffest = shiftDayZonedDate.add({
        nanoseconds: 1
    }).offsetNanoseconds;

    return Math.abs(nextOffest - previousOffest);
}

/**
 * 
 * @returns the system calendar
 */
export function getCalendar() {
    return new Intl.DateTimeFormat().resolvedOptions().calendar;
}

/**
 * 
 * @param {*} monthNumber 1 to 12
 * @returns name of month
 */
export function monthNumberToMonthName(monthNumber) {
    return [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ][monthNumber - 1];
}

const monthNameNumberMap = new Map();
monthNameNumberMap.set('january', 1);
monthNameNumberMap.set('february', 2);
monthNameNumberMap.set('march', 3);
monthNameNumberMap.set('april', 4);
monthNameNumberMap.set('may', 5);
monthNameNumberMap.set('june', 6);
monthNameNumberMap.set('july', 7);
monthNameNumberMap.set('august', 8);
monthNameNumberMap.set('september', 9);
monthNameNumberMap.set('october', 10);
monthNameNumberMap.set('november', 11);
monthNameNumberMap.set('december', 12);
monthNameNumberMap.set('jan', 1);
monthNameNumberMap.set('feb', 2);
monthNameNumberMap.set('mar', 3);
monthNameNumberMap.set('apr', 4);
monthNameNumberMap.set('may', 5);
monthNameNumberMap.set('jun', 6);
monthNameNumberMap.set('jul', 7);
monthNameNumberMap.set('aug', 8);
monthNameNumberMap.set('sep', 9);
monthNameNumberMap.set('oct', 10);
monthNameNumberMap.set('nov', 11);
monthNameNumberMap.set('dec', 12);

/**
 * 
 * @param {*} month string
 * @returns month number
 */
export function monthNameToMonthNumber(month) {
    return monthNameNumberMap.get(month.toLowerCase());
}
