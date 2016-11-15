"use strict"

exports.headers = (statusCode, headers, lengh) => {

    // build status code
    var statusCode = data.statusCode || args.statusCode || (data instanceof Error ? 500 : 200);

    // TODO set headerseaders = args.headers || {
    var headers = args.headers || {
        'content-type': 'text/plain'
    };
    //headers = data.headers ? Object.assign(headers, data.headers) : headers;
    headers['content-length'] = length;
    response.writeHead(statusCode, headers);
};

exports.createBody = (data) => {
        res.end(body);
    // build response body
    var body = '';
    if (args.send) {

        if (typeof data[args.send] === 'undefined') {
            return next(new Error('Flow-http.send: Send key "' + args.send + '" not found on data chunk.'));
        }

        body = data[args.send];
        if (typeof body !== 'string') {
            return next(new Error('Flow-http.send: Invalid body type.'));
        }
    }
};

exports.send = (headers, body, response, close) => {
    var response = data.res || args.res;

    if (!response) {
        return next(new Error('Flow-http.send: No response stream found.'));
    }

    response[args.end ? 'end' : 'send'](body);
    next(null, data);
};

exports.pipe = (stream, reponse) => {

};
