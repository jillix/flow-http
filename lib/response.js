"use strict"

function checkData (data, props) {

    props = props || [];
    props.push('res');

    for (let i = 0, l = props.length; i < l; ++i) {
        if (!data[props[i]]) {
            return new Error('Flow-http.response: Prop "' + props[i]  + '" not found on data.');
        }
    }
}

// set http status
exports.status = (scope, inst, args, data, next) => {

    let err = checkData(data, ["statusCode"]);
    if (err) {
        return next(err);
    }

    data.res.statusCode = data.statusCode;
    data.res.statusMessage = data.statusMessage;

    next(null, data);
};

// send headers
exports.headers = (scope, inst, args, data, next) => {

    let err = checkData(data, ["headers"]);
    if (err) {
        return next(err);
    }

    Object.keys(data.headers).forEach(header => data.res.setHeader(header, data.headers[header]));
    next(null, data);
};

// send trailer headers
exports.trailers = (scope, inst, args, data, next) => {

    let err = checkData(data, ["trailers"]);
    if (err) {
        return next(err);
    }

    data.res.addTrailers(data.trailers);
    next(null, data);
};

// pipe stream to response
exports.pipe = (scope, inst, args, data, next) => {

    let err = checkData(data, ["readable"]);
    if (err) {
        return next(err);
    }

    data.readable.pipe(data.res);
    next(null, data);
};

// send data to response
exports.send = (scope, inst, args, data, next) => {

    let err = checkData(data, ["body"]);
    if (err) {
        return next(err);
    }

    data.res.send(data.body);
    next(null, data);
};

// end response with data
exports.end = (scope, inst, args, data, next) => {

    let err = checkData(data);
    if (err) {
        return next(err);
    }

    data.res.end(data.body);
    next(null, data);
};
