const ccxt = require ('ccxt');
const W3CWebSocket = require('websocket').w3cwebsocket;
const async = require ('async');

const callback = {
    on: {
        update_price: function () {
            console.log(global.data)
        }
    }
}

global.data = {
    price: {
        bybit: {
            btc: 0
        },
        deribit: {
            btc: 0
        }
    }
}



// Функция для цниверсального подключения к сокет соеденениям бирж
function exchange_wss (wss='wss://', send="", callback=null, recursion=false, callback_on_update = false) {

    const client = new W3CWebSocket(wss);

    client.onerror = function() { throw 'Connection Error'; };
    client.onclose = function() { throw 'Client Closed'; };
    client.onopen = function() { client.send(send); };
    client.onmessage = function(e) { callback(e.data); if (recursion) { client.send(send); } if (callback_on_update) {callback_on_update(e.data)} };

}

// ByBit Socket
exchange_wss('wss://stream.bybit.com/realtime', JSON.stringify({
    op: "subscribe",
    args: [
        "trade.BTCUSD"
    ]
}), function (e=null) {

    let response = JSON.parse(e);

    if ('data' in response && 'topic' in response && response.topic == 'trade.BTCUSD') {
        global.data.price.bybit.btc = response.data[0].price;
    }

}, false, callback.on.update_price)

// Deribit Socket
exchange_wss('wss://www.deribit.com/ws/api/v1/', JSON.stringify({
    "action": "/api/v1/public/index"
}), function (e=null) {

    let response = JSON.parse(e);

    if ('success' in response && response.success == true && 'result' in response) {
        global.data.price.deribit.btc = response.result.btc;
    }

}, true, callback.on.update_price)
