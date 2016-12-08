"use strict"

/*methods: [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'DELETE',
    'CONNECT',
    'TRACE',
    'PATCH'
]*/

module.exports = (scope, state, args, req, res) => {

    let method = args.methods[req.method.toUpperCase()];
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
