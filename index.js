var Flow = require('flow');
var http = require('spdy');
var express = require('express');
var sessions = require('client-sessions');

exports.start = function (options, data, next) {

    // TODO call next, if server is runing
    var instance = this;

    // get global configs
    options.ssl = options.ssl || Flow.config.ssl;
    options.ses_conf = options.ses_conf|| Flow.config.session;

    var app = express();
    Flow.server = http.createServer(options.ssl, app);
    var clientSession = sessions(options.ses_conf);

    // use encrypted client sessions
    app.use(clientSession);

    // emit url to flow
    app.use(function (req, res) {

        var stream = instance.flow('http_req', {
            req: req,
            res: res,
            session: req.session
        });
        stream.o.pipe(res);
        stream.o.on('error', function (err) {
            res.status(err.code || 500).send(err.stack);
        });
        req.pipe(stream.i);

        // since GET requests are ended immediately, write the url manually to the input
        if (req.method === 'GET') {
            stream.i.write(req.url);
        }
    });

    // start http server
    Flow.server.listen(options._.port, function () {
        console.log('flow-http is listening on port', options._.port);
        next();
    });
};
