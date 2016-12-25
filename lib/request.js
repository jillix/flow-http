"use strict"

const cors_method = 'access-control-request-method';

module.exports = (scope, state, args, req, res) => {

    let method = req.method.toUpperCase();

    // handle cors request
    if (method === 'OPTIONS') {
        method = req.headers[cors_method] ? req.headers[cors_method].toUpperCase() : undefined;
    }

    method = args.methods[method];
    if (!method) {
        res.writeHead(501, 'Method not implemented', {'Content-Type': 'text/plain'});
        res.end();
        return;
    }

    // Info: create an error handler to prevent proces crash on error
    scope.flow(method).write({
        req: req,
        res: res
    });
};
