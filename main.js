const ccxt = require ('ccxt');
var W3CWebSocket = require('websocket').w3cwebsocket;


var client = new W3CWebSocket('wss://stream.bybit.com/realtime');

client.onerror = function() {
    console.log('Connection Error');
};

client.onopen = function() {
    console.log('WebSocket Client Connected');
    client.send(JSON.stringify(
        {
            op: "subscribe",
            args: [
                'kline.BTCUSD.1m'
            ]
        }
    ));
};

client.onclose = function() {
    console.log('echo-protocol Client Closed');
};

client.onmessage = function(e) {
    let message = JSON.parse(e.data);
    try {
        console.log(message.data.close)
    } catch (e) {}
};