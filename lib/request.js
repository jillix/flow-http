"use strict"

const cors_method = 'access-control-request-method';

module.exports = (scope, state, args, req, res) => {

    let method = req.method.toUpperCase();

    // handle pre-flight cors request
    if (method === 'OPTIONS') {
        method = req.headers[cors_method] ? req.headers[cors_method].toUpperCase() : undefined;

        if (args.methods[method]) {
            res.writeHead(200, 'Ok', {
                'Content-Type': 'text/plain',
                "Access-Control-Allow-Origin": scope.env.cors.static,
                "Access-Control-Allow-Methods": method,
                "Access-Control-Allow-Headers": "*"
            });
            res.end();
        } else {
            res.writeHead(501, 'Method not implemented', {'Content-Type': 'text/plain'});
            res.end();
        }

        return;
    }

    method = args.methods[method];
    if (!method) {
        res.writeHead(501, 'Method not implemented', {'Content-Type': 'text/plain'});
        res.end();
        return;
    }

    //create default session
    if (!req.session) {
        req.session = {
            role: scope.env.role
        };
    }

    // Info: create an error handler to prevent proces crash on error
    const flow = scope.flow(method, {req: req, res: res}, true);
    flow.done = (err, data, stream) => {
        if (err) {
            res.writeHead(500, 'Server Error', {'Content-Type': 'text/plain'});
            res.end(err.stack.toString());
        }
    };
    req.pipe(flow);//.pipe(res);
};
