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

module.exports = (scope, inst, args, req, res) => {

    let method = req.method.toUpperCase();
    if (!args.mehtods[method]) {
        // TODO servers are required to support GET and HEAD
        // TODO send 501 not implemented
        res.writeHead();
        res.end(body);
        return;
    }

    // Info: create an error handler to prevent proces crash on error
    scope.flow(inst._name + '/' + method).write({
        req: req,
        res: res
    });
};
