var http = require('spdy');
var path = require('path');
var fs = require('fs');
var sessions = require('client-sessions');
var concat = require('concat-stream');
var cwd = process.cwd();
var servers = {};

// default session config
var crypto = require('crypto');
var defaultSession = {
    cookieName: 'SES', // cookie name dictates the key name added to the request object
    requestKey: 'session', // requestKey overrides cookieName for the key name added to the request object
    secret: crypto.randomBytes(64).toString('hex'), // should be a large unguessable string
    duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
    activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
    cookie: {
        ephemeral: false, // when true, cookie expires when the browser closes
        httpOnly: true, // when true, cookie is not accessible from javascript
        secure: true // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
    },

    // flow app related configs
    wildcard: '*',
    role: 'role',
    user: 'user',
    locale: 'locale'
};

// read ssl files
function getSslInfo (ssl) {

    if (!ssl || !ssl.cert || !ssl.key) {
        return new Error('Flow-http.ssl: No ssl config.');
    }

    ssl.cert = path.normalize(ssl.cert);
    ssl.key = path.normalize(ssl.key);

    // file read will throw an error
    try {
        ssl.cert = fs.readFileSync(path.resolve(cwd + ssl.cert));
    } catch (err) {
        return err;
    }
    try {
        ssl.key = fs.readFileSync(path.resolve(cwd + ssl.key));
    } catch (err) {
        return err;
    }

    return ssl;
}

exports.start = function (options, data, next) {

    options._ = Object.assign(defaultSession, options._);
    var sslError;
    if ((sslError = getSslInfo(options._.ssl)) instanceof Error) {
        return next(sslError);
    }

    var port = options._.port;
    if (typeof port === 'boolean' || isNaN(port) || port < 1 || port > 65535) {
        return next(new Error('Flow-http: Port is not a number'));
    }

    // call next, if server is runing
    if (servers[port]) {
        return next(null, data);
    }

    var instance = this;
    var clientSession = sessions(options._);

    servers[port] = http.createServer(options._.ssl, function (req, res) {

        // use encrypted client sessions
        clientSession(req, res, function () {
            instance.flow('http_req').write({
                req: req,
                res: res,
                session: req.session
            });
        });
    })

    // start http server
    servers[port].listen(port, function () {
        console.log('flow-http is listening on port', port);
        next(null, {server: servers[port], session: clientSession});
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

    if (method === 'post') {
        data.req.pipe(concat(function (chunk) {
            data[to] = chunk;
            next(null, data); 
        }));
        data.req.on('error', next);
    } else {
        next(null, data);
    }
};

// send data to response stream
exports.send = function (options, data, next) {

    var response = data.res || data._.res;
    if (!response) {
        return next(new Error('Flow-http.send: No response stream found.'));
    }

    console.log('Flow-http.send:', Object.keys(data._));

    // TODO check if data to send exists
    var send = {}
    if (options._.send) {
        options._.send.forEach(function (key) {
            if (data[key] !== undefined) {
                send[key] = data[key];
            }
        });
    } else {
        send = data;
    }

    // TODO set headers

    // handle errors
    if (send instanceof Error) {
        response.writeHead(send.statusCode || 500, {
            'content-type': 'text/plain'
        });

        send = send.message;

    // end response stream
    } else {

        response.writeHead(send.statusCode || 200, {
            'content-type': 'text/plain'
        });
    }

    response[options._.end ? 'end' : 'send'](send);
    next(null, data);
};
