function computeAdditionChains(n, currentChains, minimumChains) {
    while (!minimumChains.has(n)) {
        const newChains = [];

        for (const valueAndWorkChain of currentChains) {
            const valueChain = valueAndWorkChain[0];
            const workChain = valueAndWorkChain[1];
            const maximumValue = valueChain[valueChain.length - 1];

            for (const value of valueChain) {
                const newValue = value + maximumValue;
                const newWorkChain = [...workChain, [value, maximumValue]];
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

function minimumAdditionChain(n, currentChains, minimumChains) {
    if (n < 0) {
        return null;
    }

    computeAdditionChains(n, currentChains, minimumChains);
    return minimumChains.get(n);
}

/**
 * gets the additions from the minimum chain
 * 
 * @param {*} minimumChain 
 * @returns 
 */
function getAdditions(minimumChain) {
    let additions = [];

    for (let i = minimumChain.length - 1; i >= 1; i--) {
        const previous = minimumChain[i - 1];
        const addition = minimumChain[i] - previous;
        additions.push([addition, previous]);
    }

    return additions.reverse();
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

    const minimumValueAndWorkChains = minimumAdditionChain(n, currentChains, minimumChains);
    const minimumLength = minimumValueAndWorkChains[1].length;
    console.log(minimumValueAndWorkChains, minimumLength);

    console.log(getAdditions(minimumValueAndWorkChains[0]));
}

main();
