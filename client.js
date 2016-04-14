exports.fetch = function (options, data, next) {

    options.url = options.url || options._.url;
    if (typeof options.url !== 'string') {
        return next(new Error('Flow-http.request: Invalid url.'));
    }

    // TODO create a json parser data handler
    if (typeof data === 'object') {
        data = JSON.stringify(data);
    }
    console.log('http client data type:', data);

    var error;
    fetch(options.url, {
        method: options.method || 'post',
        credentials: 'same-origin',
        body: data
    }).then(function (response) {
        if (!response.ok) {
            error = true;
        }
        return response.text();
    }).then(function (text) {
        if (error) {
            next(new Error(text));
        } else {
            next(null, text);
        }
    }).catch(next);
};
