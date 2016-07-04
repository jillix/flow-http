exports.fetch = function (options, data, next) {

    options.url = options._.url || options.url;
    if (typeof options.url !== 'string') {
        return next(new Error('Flow-http.request: Invalid url.'));
    }

    var error;
    fetch(options.url, {
        method: options.method || options._.method || 'post',
        credentials: 'same-origin',
        body: data,
		mode: options.mode || options._.mode || 'cors'
    }).then(function (response) {
        if (!response.ok) {
            error = true;
        }

        // TODO https://developer.mozilla.org/en-US/docs/Web/API/Body 
        //      check if body implements a streaming interfaces

        // TODO what to return? check also body methods

        // TODO call next with response?
        return response.text();

    }).then(function (text) {
        if (error) {
            next(new Error(text));
        } else {
            next(null, text);
        }
    }).catch(next);
};
