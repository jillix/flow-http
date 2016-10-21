//var http = require('spdy');
var http = require('http');
var path = require('path');
var fs = require('fs');
var concat = require('concat-stream');
var cwd = process.cwd();
var servers = {};

// flow app related configs
var defaultConfig = {
    wildcard: '*',
    role: 'role',
    user: 'user',
    locale: 'locale'
};

// read ssl files
function getSslInfo (args) {

    let ssl = args.ssl = process.flow_env.ssl || args.ssl || {};

    // the environment variable configurations have priority
    ssl.cert = path.resolve(ssl.cert);
    ssl.key = path.resolve(ssl.key);

    if (!ssl.cert || !ssl.key) {
        return new Error('Flow-http: No or incomplete SSL config.');
    }

    // file read will throw an error
    try {
        ssl.cert = fs.readFileSync(ssl.cert);
        ssl.key = fs.readFileSync(ssl.key);
    } catch (err) {
        return err;
    }
}

exports.start = function (args, data, next) {

    const self = this;
    args = Object.assign(defaultConfig, args);
    let sslError;
    if ((sslError = getSslInfo(args)) instanceof Error) {
        return next(sslError);
    }

    // the environment variable configurations have priority
    var portConfigured = process.flow_env.port || args.port;
    var port = Number.parseInt(portConfigured);
    if (isNaN(port) || port < 1 || port > 65535) {
        return next(new Error('Flow-http: The port option is not a valid port number: ' + portConfigured));
    }

    // call next, if server is runing
    if (servers[port]) {
        return next(null, data);
    }

    servers[port] = http.createServer(/*args.ssl, */function (req, res) {

        let method = args.methods && args.methods[req.method] ? args.methods[req.method] : req.method.toUpperCase();
        let event = self.flow(self._name + '/' + method);

        event.write({
            req: req,
            res: res
        });
    })

    // start http server
    servers[port].listen(port, function () {
        next(null, 'Flow-http is listening on port:' + port + '\n');
    });
};

// send data to response stream
exports.concat = function (options, data, next) {

    if (!data.req) {
        return next(new Error('Flow-http.data: No request stream found.'));
    }

    var request = data.req;
    var method = data.req.method.toLowerCase();
    var to = options.to || 'http_req_body';

    data.req.pipe(concat(function (chunk) {
        data[to] = chunk;
        next(null, data); 
    }));
    data.req.on('error', next);
};

// send data to response stream
exports.send = function (options, data, next) {

    var response = data.res || options.res;

    if (!response) {
        return next(new Error('Flow-http.send: No response stream found.'));
    }

    // build response body
    var body = '';
    if (options.send) {

        if (typeof data[options.send] === 'undefined') {
            return next(new Error('Flow-http.send: Send key "' + options.send + '" not found on data chunk.'));
        }

        body = data[options.send];
        if (typeof body !== 'string') {
            return next(new Error('Flow-http.send: Invalid body type.'));
        }
    }

    // build status code
    var statusCode = data.statusCode || options.statusCode || (data instanceof Error ? 500 : 200);

    // TODO set headers
    var headers = options.headers || {
        'content-type': 'text/plain'
    };
    headers['content-length'] = body.length;
    response.writeHead(statusCode, headers);
    response[options.end ? 'end' : 'send'](body);
    next(null, data);
};
