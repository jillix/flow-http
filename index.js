var http = require('spdy');
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
function getSslInfo (ssl) {

    ssl = ssl || {};

    // the environment variable configurations have priority
    var cert = process.env.FLOW_HTTP_CERT || ssl.cert;
    var key = process.env.FLOW_HTTP_KEY || ssl.key;

    if (!cert || !key) {
        return new Error('Flow-http: No or incomplete SSL config.');
    }

    ssl.cert = path.normalize(cert);
    ssl.key = path.normalize(key);

    // file read will throw an error
    try {
        ssl.cert = fs.readFileSync(path.resolve((ssl.cert[0] !== '/' ? cwd + '/' : '') + ssl.cert));
        ssl.key = fs.readFileSync(path.resolve((ssl.key[0] !== '/' ? cwd + '/' : '') + ssl.key));
    } catch (err) {
        return err;
    }

    return ssl;
}

exports.start = function (options, data, next) {

    options._ = Object.assign(defaultConfig, options._);
    var sslError;
    if ((sslError = getSslInfo(options._.ssl)) instanceof Error) {
        return next(sslError);
    }

    // the environment variable configurations have priority
    var portConfigured = process.env.FLOW_HTTP_PORT || options._.port;
    var port = Number.parseInt(portConfigured);
    if (isNaN(port) || port < 1 || port > 65535) {
        return next(new Error('Flow-http: The port option is not a valid port number: ' + portConfigured));
    }

    // call next, if server is runing
    if (servers[port]) {
        return next(null, data);
    }

	var event = this.flow('http_req');
    servers[port] = http.createServer(options._.ssl, function (req, res) {
		event.write({
			req: req,
			res: res
		});
    })

    // start http server
    servers[port].listen(port, function () {
        console.log('flow-http is listening on port', port);
        next(null, {server: servers[port]});
    });
};

// send data to response stream
exports.concat = function (options, data, next) {

    if (!data.req) {
        return next(new Error('Flow-http.data: No request stream found.'));
    }

    var request = data.req;
    var method = data.req.method.toLowerCase();
    var to = options._.to || 'http_req_body';

    data.req.pipe(concat(function (chunk) {
        data[to] = chunk;
        next(null, data); 
    }));
    data.req.on('error', next);
};

// send data to response stream
exports.send = function (options, data, next) {

    var response = data.res || data._.res || options._.res;

    if (!response) {
        return next(new Error('Flow-http.send: No response stream found.'));
    }

    // build response body
    var body = '';
    if (options._.send && typeof data[options._.send] !== 'undefined') {
        body = data[options._.send];
    } else {
        return next(new Error('Flow-http.send: Send key not found on data chunk.'));
    }

    if (typeof body !== 'string') {
        return next(new Error('Flow-http.send: Invlid body type.'));
    }

    // build status code
    var statusCode = data.statusCode || options._.statusCode || (data instanceof Error ? 500 : 200);

    // TODO set headers
    var headers = options._.headers || {
        'content-type': 'text/plain'
    };
    headers['content-length'] = body.length;

    response.writeHead(statusCode, headers);
    response[options._.end ? 'end' : 'send'](body);
    next(null, data);
};
