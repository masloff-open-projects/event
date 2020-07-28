const ccxt = require ('ccxt');
const W3CWebSocket = require('websocket').w3cwebsocket;

function exchange_wss (wss='wss://', send="", callback=null) {

    const client = new W3CWebSocket(wss);

    client.onerror = function() { throw 'Connection Error'; };
    client.onclose = function() { throw 'Client Closed'; };
    client.onopen = function() { client.send(send); };
    client.onmessage = function(e) { callback(e.data); };

}

// exchange_wss('wss://stream.bybit.com/realtime', JSON.stringify({
//     op: "subscribe",
//     args: [
//         'kline.BTCUSD.1m'
//     ]
// }), function (e=null) {
//     console.log(e)
// })

exchange_wss('wss://www.deribit.com/ws/api/v1/', JSON.stringify({
    "action": "/api/v1/public/index"
}), function (e=null) {
    console.log(e)
})
