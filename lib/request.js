'use strict';

const CORS_METHOD = 'access-control-request-method';

module.exports = (FlowHttp, config, req, res) => {

    let method = req.method.toUpperCase();

    // handle pre-flight cors request
    if (method === 'OPTIONS') {
        method = req.headers[CORS_METHOD] ? req.headers[CORS_METHOD].toUpperCase() : undefined;

        if (config.methods[method]) {
            res.writeHead(200, 'Ok', {
                'Content-Type': 'text/plain',
                'Access-Control-Allow-Origin': config.cors.static,
                'Access-Control-Allow-Methods': method,
                'Access-Control-Allow-Headers': '*'
            });
            res.end();
        } else {
            res.writeHead(501, 'Method not implemented', {'Content-Type': 'text/plain'});
            res.end();
        }

        return;
    }

    method = config.methods[method];
    if (!method) {
        res.writeHead(501, 'Method not implemented', {'Content-Type': 'text/plain'});
        res.end();
        return;
    }

    //create default session
    if (!req.session) {
        req.session = {
            role: config.role
        };
    }

    // Info: create an error handler to prevent proces crash on error
    FlowHttp.emit('request', {
        method: method,
        req: req,
        res: res
    });
};
