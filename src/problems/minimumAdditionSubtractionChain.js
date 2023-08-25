function computeAdditionSubtractionChains(n, currentChains, minimumChains) {
    while (!minimumChains.has(n)) {
        const newChains = [];

        for (const valueAndWorkChain of currentChains) {
            const valueChain = valueAndWorkChain[0];
            const workChain = valueAndWorkChain[1];
            const maximumValue = valueChain[valueChain.length - 1];

            for (const value of valueChain) {
                const newValue = maximumValue - value;
                const newWorkChain = [...workChain, [maximumValue, "-", value]];
                const newValueChain = [...valueChain, newValue];
                const newChain = [newValueChain, newWorkChain];
                newChains.push(newChain);

                if (!minimumChains.has(newValue)) {
                    minimumChains.set(newValue, newChain);
                }
            }

            for (const value of valueChain) {
                const newValue = value + maximumValue;
                const newWorkChain = [...workChain, [value, "+", maximumValue]];
                const newValueChain = [...valueChain, newValue];
                const newChain = [newValueChain, newWorkChain];
                newChains.push(newChain);

                if (!minimumChains.has(newValue)) {
                    minimumChains.set(newValue, newChain);
                }
            }
        }

        currentChains = newChains;
    }
}

function minimumAdditionSubtractionChain(n, currentChains, minimumChains) {
    if (n < 0) {
        return null;
    }

    computeAdditionSubtractionChains(n, currentChains, minimumChains);
    return minimumChains.get(n);
}

/**
 * gets the additions and subtractions from the minimum chain
 * 
 * @param {*} minimumChain 
 * @returns 
 */
function getAdditionSubtractions(minimumChain) {
    let additionSubtractions = [];

    for (let i = minimumChain.length - 1; i >= 1; i--) {
        const previous = minimumChain[i - 1];
        const current = minimumChain[i];

        if (current > previous) {
            const addition = current - previous;
            additionSubtractions.push([addition, '+', previous]);
        }
        else {
            const subtraction = previous - current;
            additionSubtractions.push([previous, '-', subtraction]);
        }
    }

    return additionSubtractions.reverse();
}

function main() {
    const initialValue = 1;
    const initialValueChain = [initialValue];
    const initialChain = [initialValueChain, []]; // value chain, work chain

    const minimumChains = new Map();
    minimumChains.set(0, [[], []]); // value, [value chain, work chain]
    minimumChains.set(initialValue, initialChain); // value, [value chain, work chain]

    const currentChains = [initialChain];

    const n = 31;

    const minimumValueAndWorkChains = minimumAdditionSubtractionChain(n, currentChains, minimumChains);
    const minimumLength = minimumValueAndWorkChains[1].length;
    console.log(minimumValueAndWorkChains, minimumLength);

    console.log(getAdditionSubtractions(minimumValueAndWorkChains[0]));
}

main();
