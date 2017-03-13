'use strict';

const http = require('spdy');
const SSL = require('./lib/ssl');
const Events = require('events');
const Request = require('./lib/request');
const Response = require('./lib/response');

module.exports = () => {
    let FlowHttp = new Events();
    FlowHttp.servers = {};

    // FlowHttp methods
    FlowHttp.listen = (config, callback) => {
        config = config || {};

        // get ssl config
        const ssl = SSL.get(config)
        if (!ssl) {
            return callback(new Error('No ssl info found in config.'));
        }

        // get port config
        const port = Number.parseInt(config.port);
        if (isNaN(port) || port < 1 || port > 65535) {
            return callback(new Error('The port option is not a valid port number or out of range.'));
        }

        // exit if server is already running
        if (FlowHttp.servers[port]) {
            return callback(null);
        }

        FlowHttp.servers[port] = http.createServer(ssl, (req, res) => Request(FlowHttp, config, req, res));
        FlowHttp.servers[port].listen(port, () => callback(null, 'Flow-http is listening on port: ' + port + '\n'));
        FlowHttp.servers[port].on('close', () => FlowHttp.servers[port] = null);
    };
    FlowHttp.status = Response.status;
    FlowHttp.headers = Response.headers;
    FlowHttp.trailers = Response.trailers;
    FlowHttp.pipe = Response.pipe;
    FlowHttp.send = Response.send;
    FlowHttp.end = Response.end;

    return FlowHttp;
};