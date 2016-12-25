"use strict"

exports.fetch = function (scope, inst, options, data, next) {

    if (typeof options.url !== 'string' && typeof data.url !== 'string') {
        return next(new Error('Flow-http.request: Invalid url.'));
    }

    let error;
    const method = options.method ? options.method.toUpperCase() : 'GET';
    fetch(options.url || data.url, {
        method: method,
        credentials: 'same-origin',
        body: options.requestBody ? data[options.requestBody] : data,
        mode: options.mode || 'cors'
    }).then(function (response) {
        if (!response.ok) {
            error = true;
        }

        // TODO https://developer.mozilla.org/en-US/docs/Web/API/Body 
        //      check if body implements a streaming interfaces

        // TODO what to return? check also body methods

        // TODO call next with response?
        return response.text();

    }).then(function (text) {
        if (error) {
            next(new Error(text));
        } else {
            options.key ? (data[options.key] = text) : (data = text);
            next(null, data);
        }
    }).catch(next);
};
