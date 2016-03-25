//var http = require('flowhttp');

exports.fetch = function (options, data, next) {

    if (typeof options.url !== 'string') {
        return output.emit('error', new Error('Flow-http.request: Invalid url.', url))
    }

    var error;
    fetch(options.url, {
      method: options.method || 'post',
      body: data
    }).then(function (response) {
        if (!response.ok) {
            error = true;
        }
        return response.text();
    }).then(function (text) {
        if (error) {
            next(text)
        } else {
            next(null, text);
        }
    }).catch(function (err) {
        next(err);
    });
};

exports.request = function (options, output) {
/*
    // TODO transform object to string/buffer (JSON.stringify)

    var opts = {
        method: 'POST|GET|PUT|DELETE',
        path: '/' + instance._name + ':' + eventName.substr(1)
       headers: {},
        host: window.location.host,
        port: window.location.port
        responseType: 'response type to set on the underlying xhr object'
    };

    var input = http[options.method || 'post'](options.url);

    // check status code and emit error
    input.on('response', function (res) {
        var code = res.statusCode;
        if (code > 299) {

            // end output stream immediately
            output.end();

            // collect error data
            var resData = '';
            res.on('data', function (chunk) {
                resData += chunk.toString();
            });

            // emit error on response end
            res.on('end', function () {
                var err = new Error(resData);
                err.statusCode = code;
                output.emit('error', err);
            });
        }
    });

    return input;
*/
};
