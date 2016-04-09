exports.fetch = function (options, data, next) {

    options.url = options.url || options._.url;
    if (typeof options.url !== 'string') {
        return next(new Error('Flow-http.request: Invalid url.'));
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
            next(text);
        } else {
            next(null, text);
        }
    }).catch(next);
};
