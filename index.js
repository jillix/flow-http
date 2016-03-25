var http = require('spdy');
var path = require('path');
var fs = require('fs');
var sessions = require('client-sessions');
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
        secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
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

            var stream = instance.flow('http_req', {
                req: req,
                res: res,
                session: req.session
            });
            stream.on('error', function (err) {
                res.statusCode = err.code || 500;
                res.end(err.stack);
            });
            stream.pipe(res);
            req.pipe(stream);

            // since GET requests are ended immediately, write the url manually to the input
            if (req.method === 'GET') {
                stream.end(req.url);
            }
        });
    })

    // start http server
    servers[port].listen(port, function () {
        console.log('flow-http is listening on port', port);
        next(null, {server: servers[port], session: clientSession});
    });
};
