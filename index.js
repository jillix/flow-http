"use strict"

const http = require('spdy');
const SSL = require('./lib/ssl');
const Request = require('./lib/request');
const Response = require('./lib/response');
const servers = {};

exports.listen = (scope, inst, args, data, next) => {

    // TODO get ssl key and cert
    const ssl = SSL.get(scope.env.ssl);
    if (!ssl) {
        return next(new Error('Flow-http.ssl: No ssl info found in environment.'));
    }

    const port = Number.parseInt(scope.env.port || args.port);
    if (isNaN(port) || port < 1 || port > 65535) {
        return next(new Error('Flow-http: The port option is not a valid port number or out of range.'));
    }

    // call next, if server is runing
    if (servers[port]) {
        return next(null, data);
    }

    servers[port] = http.createServer((req, res) => Request(scope, inst, args, req, res));
    servers[port].listen(port, () => next(null, 'Flow-http is listening on port:' + port + '\n'));
    servers[port].on('close', () => servers[port] = null);
};

// pipe stream to response
exports.pipe = (scope, inst, args, data, next) => {
    // TODO check data properties
    Response.pipe(data.stream, data.res);
    next(null, data);
};

// send data to response
exports.send = (scope, inst, args, data, next) => {
    // TODO check data properties
    Response.send(data.headers, data.body, data.res, data.close);
    next(null, data);
};

exports.headers = (scope, inst, args, data, next) => {}
exports.body = (scope, inst, args, data, next) => {}
