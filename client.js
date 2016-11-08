exports.fetch = function (scope, inst, options, data, next) {

    if (typeof options.url !== 'string' && typeof data.url !== 'string') {
        return next(new Error('Flow-http.request: Invalid url.'));
    }

    var error;
    fetch(options.url || data.url, {
        method: options.method || 'post',
        credentials: 'same-origin',
        body: data,
		mode: options.mode || 'cors'
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
            options.key ? (data[options.key] = text) : (data = text);
            next(null, data);
        }
    }).catch(next);
};
