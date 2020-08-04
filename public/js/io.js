const io = new WebSocket(`${location.protocol == 'http:' ? 'ws' : 'wss'}://${location.host}`);
const wss_stream = new wstream(io);

if (wss_stream) {
    wss_stream.call('init', {});
}

io.onerror = function (event) {
    wss_stream.call('error', {
        isOpen: io.readyState !== io.OPEN
    });
}

io.onclose = function (event) {
    wss_stream.call('close', {
        isOpen: io.readyState !== io.OPEN
    });
}

io.onopen = function (event) {
    wss_stream.call('open', {});
}

io.onmessage = function (event) {
    const response = JSON.parse(event.data);
    wss_stream.ws(response.action, response.data)
    wss_stream.call('message', event)
}
