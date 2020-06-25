// Drum Arrays
let kicks = [];
let snares = [];
let hiHats = [];
let rideCymbals = [];

for (let i = 0; i < 16; i++) {
    kicks[i] = false;
    snares[i] = false;
    hiHats[i] = false;
    rideCymbals[i] = false;
}

const getDrumArrayByName = (name) => {
    switch (name) {
        case 'kicks':
            return kicks;
        case 'snares':
            return snares;
        case 'hiHats':
            return hiHats;
        case 'rideCymbals':
            return rideCymbals;
        default:
            return;
    }
};

const toggleDrum = (instrument, index) => {
    const drum = getDrumArrayByName(instrument);
    if (index < 0 || index > 15 || !drum) return;
    drum[index] = !drum[index];
};

const clear = instrument => {
    const drum = getDrumArrayByName(instrument);
    if (!drum) return;
    drum.fill(false);
};

const invert = instrument => {
    const drum = getDrumArrayByName(instrument);
    if (!drum) return;

    for (let i = 0; i < drum.length; i++) drum[i] = !drum[i];
};

const getNeighborPads = (x, y, size) => {
    const neighbors = [];
    if (x >= size || y >= size || x < 0 || y < 0 || size < 1) {
        return neighbors;
    }
    neighbors.push([x - 1, y]);
    neighbors.push([x, y - 1]);
    neighbors.push([x + 1, y]);
    neighbors.push([x, y + 1]);

    return neighbors.filter(neighbor => neighbor.every(element => element >= 0 && element < size));
}
