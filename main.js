const ccxt = require ('ccxt');
const W3CWebSocket = require('websocket').w3cwebsocket;

// Функция для цниверсального подключения к сокет соеденениям бирж
function exchange_wss (wss='wss://', send="", callback=null, recursion=false) {

    const client = new W3CWebSocket(wss);

    client.onerror = function() { throw 'Connection Error'; };
    client.onclose = function() { throw 'Client Closed'; };
    client.onopen = function() { client.send(send); };
    client.onmessage = function(e) { callback(e.data); if (recursion) { client.send(send); }};

}

// ByBit Socket
exchange_wss('wss://stream.bybit.com/realtime', JSON.stringify({
    op: "subscribe",
    args: [
        'kline.BTCUSD.1m'
    ]
}), function (e=null) {

    let response = JSON.parse(e);

    if ('data' in response && 'close' in response.data) {
        console.log('ByBit', response.data.close)
    }

})

// Deribit Socket
exchange_wss('wss://www.deribit.com/ws/api/v1/', JSON.stringify({
    "action": "/api/v1/public/index"
}), function (e=null) {

    let response = JSON.parse(e);

    if ('success' in response && response.success == true && 'result' in response) {
        console.log('Deribit', response.result.btc)
    }

}, true)
