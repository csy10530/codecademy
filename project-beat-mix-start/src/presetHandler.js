// Use this presets array inside your presetHandler
const presets = require('./presets');

// Complete this function:
const presetHandler = (request, index, newPresetArray = []) => {
    const response = [];

    if (index >= presets.length || index < 0) {
        response[0] = 404;
        return response;
    }

    if (request != "GET" && request != "PUT") {
        response[0] = 400;
        return response;
    }

    response[0] = 200;

    if (request === "GET") response[1] = presets[index];

    else if (request === "PUT") {
        response[1] = newPresetArray;
        presets[index] = newPresetArray;
    }

    return response;
};

// Leave this line so that your presetHandler function can be used elsewhere:
module.exports = presetHandler;
