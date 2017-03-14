'use strict';

const CORS_METHOD = 'access-control-request-method';

module.exports = (config, req, res, callback) => {

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
            res.end('Method not implemented');
        }

        return;
    }

    method = config.methods[method];
    if (!method) {
        res.writeHead(501, 'Method not implemented', {'Content-Type': 'text/plain'});
        res.end('Method not implemented');
        return;
    }

    //create default session
    if (!req.session) {
        req.session = {
            role: config.role
        };
    }

    callback(null, {
        method: method,
        req: req,
        res: res
    });
};
