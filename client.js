'use strict';

/* Arguments: {
    url: "url",
    method: "http method",
    mode: "cors",
    body: "data[args.body]"
    key: "data[key] = result"
}*/

exports.fetch = (args, data, callback) => {

    if (typeof args.url !== 'string' && typeof data.url !== 'string') {
        return callback(new Error('Flow-http.request: Invalid url.'));
    }

    const method = (data.method || args.method || 'GET').toUpperCase();
    const options = {
        method: method,
        credentials: 'same-origin',
        mode: args.mode || 'cors'
    };

    // Request body
    if (typeof args.body === 'string' && data[args.body] !== undefined) {
        options.body = data[args.body];
    }

    let error;
    fetch(args.url || data.url, options).then((response) => {

        if (!response.ok) {
            error = true;
        }

        switch (response.headers.get('content-type')) {
            case "application/json":
                return response.json();
            case "text/plain":
            case "text/html":
            case "text/css":
                return response.text();
            default:
                return response.blob();
        }

        // TODO https://developer.mozilla.org/en-US/docs/Web/API/Body 
        //      check if body implements a streaming interfaces

    }).then((res) => {
        if (error) {
            callback(new Error(res));
        } else {
            args.key ? (data[args.key] = res) : (data = res);
            callback(null, data);
        }
    }).catch(callback);
};
