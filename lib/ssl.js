"use strict"

const path = require('path');
const fs = require('fs');

// TODO make it async ..and a separate module!
exports.get = (config) => {

    if (!config.cert || !config.key) {
        return;
    }

    config.cert = path.resolve(config.cert);
    config.key = path.resolve(config.key);

    try {
        config.cert = fs.readFileSync(config.cert);
        config.key = fs.readFileSync(config.key);
    } catch (err) {
        return console.log('Flow-ssl.get:', err);
    }

    return config;
};
