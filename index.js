"use strict"

const http = require('spdy');
const SSL = require('./lib/ssl');
const Request = require('./lib/request');
const Response = require('./lib/response');
const servers = {};

exports.listen = (scope, inst, args, data, stream, next) => {

    const ssl = SSL.get(scope.env.ssl);
    if (!ssl) {
        return next(new Error('Flow-http.ssl: No ssl info found in environment.'));
    }

    const port = Number.parseInt(scope.env.port || data.port);
    if (isNaN(port) || port < 1 || port > 65535) {
        return next(new Error('Flow-http: The port option is not a valid port number or out of range.'));
    }

    // call next, if server is runing
    if (servers[port]) {
        return next(null, data);
    }

    servers[port] = http.createServer(ssl, (req, res) => Request(scope, inst, args, req, res));
    servers[port].listen(port, () => {
        stream.write && stream.write('Flow-http is listening on port: ' + port + '\n');
        next(null, data, stream);
    });
    servers[port].on('close', () => servers[port] = null);
};

exports.status = Response.status;
exports.headers = Response.headers;
exports.trailers = Response.trailers;
exports.pipe = Response.pipe;
exports.send = Response.send;
exports.end = Response.end;
