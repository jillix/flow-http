'use strict';

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
exports.status = (data, callback) => {
    data.statusCode = data.statusCode || 500;
    let err = checkData(data, ['statusCode']);
    if (err) {
        return callback(err);
    }

    data.res.statusCode = data.statusCode;
    data.res.statusMessage = data.statusMessage;

    callback();
};

// send headers
exports.headers = (data, callback) => {

    let err = checkData(data, ['headers']);
    if (err) {
        return callback(err);
    }

    Object.keys(data.headers).forEach(header => data.res.setHeader(header, data.headers[header]));
    callback();
};

// send trailer headers
exports.trailers = (data, callback) => {

    let err = checkData(data, ['trailers']);
    if (err) {
        return callback(err);
    }

    data.res.addTrailers(data.trailers);
    callback();
};

// pipe stream to response
exports.pipe = (data, target, callback) => {

    let err = checkData(data, [target]);
    if (err) {
        return callback(err);
    }

    data[target].pipe(data.res);

    if (data.resume) {
        if (data.resume instanceof Array) {
            data.resume.forEach(stream => stream.resume());
        } else {
            data.resume.resume();
        }
    }

    callback();
};

// send data to response
exports.send = (data, callback) => {

    let err = checkData(data, ['body']);
    if (err) {
        return callback(err);
    }

    data.res.send(data.body);
    callback();
};

// end response with data
exports.end = (data, callback) => {

    let err = checkData(data);
    if (err) {
        return callback(err);
    }

    data.res.end(data.body);
    callback();
};
