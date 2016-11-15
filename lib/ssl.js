"use strict"

const path = require('path');
const fs = require('fs');

// TODO make it async, or separate module!
exports.get = (env, args) => {

    let ssl = args.ssl = env.ssl || args.ssl || {};

    // the environment variable configurations have priority
    ssl.cert = path.resolve(ssl.cert);
    ssl.key = path.resolve(ssl.key);

    if (!ssl.cert || !ssl.key) {
        return new Error('Flow-http: No or incomplete SSL config.');
    }

    // file read will throw an error
    try {
        //ssl.cert = fs.readFileSync(ssl.cert);
        //ssl.key = fs.readFileSync(ssl.key);
    } catch (err) {
    
    }
    return ssl;
};
