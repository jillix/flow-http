var Flow = require('flow');
var http = require('spdy');
var sessions = require('client-sessions');

exports.start = function (options, data, next) {

    // TODO call next, if server is runing
    var instance = this;
    var clientSession = sessions(options.ses_conf|| Flow.config.session);

    Flow.server = http.createServer(options.ssl || Flow.config.ssl, function (req, res) {

        // use encrypted client sessions
        clientSession(req, res, function () {

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
    });

    // start http server
    Flow.server.listen(options._.port, function () {
        console.log('flow-http is listening on port', options._.port);
        next();
    });
};
