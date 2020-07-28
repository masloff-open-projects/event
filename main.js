const ccxt = require ('ccxt');
const W3CWebSocket = require('websocket').w3cwebsocket;
// const async = require ('async');

global.data = {
    price: {
        bybit: {
            btc: 0
        },
        deribit: {
            btc: 0
        }
    },
    orders: {
        bybit: {
            open: false,
            type: ''
        },
        deribit: {
            open: false,
            type: ''
        }
    }
}


class exchange {

    constructor(exchange={}, testnet=false) {

        this.exchange = exchange;

        if (testnet) {
            for (const exchange in this.exchange) {
                if (typeof this.exchange[exchange].urls == typeof {} && 'test' in this.exchange[exchange].urls) {
                    this.exchange[exchange].urls.api = this.exchange[exchange].urls.test
                }
            }
        }

    }

    balance (exchange) {
        return (this.exchange[exchange]).fetch_balance();
    }

    buy (exchange, pair="BTC/USD", value=1, price=0, market=false) {
        if (market) {
            return (this.exchange[exchange]).createMarketBuyOrder(pair, value, price);
        } else {
            return (this.exchange[exchange]).createLimitBuyOrder(pair, value, price);
        }
    }

    sell (exchange, pair="BTC/USD", value=1, price=0, market=false) {
        if (market) {
            return (this.exchange[exchange]).createMarketSellOrder(pair, value, price);
        } else {
            return (this.exchange[exchange]).createLimitSellOrder(pair, value, price);
        }
    }

    positions (exchange, symbol='BTC/USD') {
        return this.exchange[exchange].fetchMyTrades(symbol)
    }

    markets (exchange) {
        return this.exchange[exchange].loadMarkets()
    }

    close (exchange, id=0, symbol='BTC/USD') {
        return this.exchange[exchange].cancelOrder(id, symbol);
    }
}

const exchge = new exchange({
    deribit: new ccxt.deribit({
        apiKey: 'A1pCeNpp',
        secret: 'dD_81yOvEPM3IchPmaQTZdJp-nqaK5c-LekGLM1UVRA'
    }),
    bybit: new ccxt.bybit({
        apiKey: 'N5rLZo7KloYMVDlO4r',
        secret: 'J7uaatltWwKA864mmU4NrQ43GcUB5tWJleWB'
    })
}, true);

// Набор функций для обработки состояний
const callback = {
    on: {
        update_price: function () {

            let ByBit = global.data.price.bybit.btc;
            let Deribit = global.data.price.deribit.btc;
            let Delta = ByBit - Deribit;

            // Проверяем, загрузились ли балансы
            if (ByBit && Deribit) {
                console.log(ByBit, Deribit, Delta)

                if (Delta > 1) {

                    if (!global.data.orders.bybit.open) {

                        exchge.sell('bybit', 'BTC/USD', 1, ByBit)
                        exchge.buy('bybit', 'BTC/USD', 1, ByBit-5 )

                        global.data.orders.bybit.open = true;
                        global.data.orders.bybit.type = 'short';

                        console.log('Bybit open short', ByBit)

                    }

                    if (!global.data.orders.deribit.open) {

                        exchge.sell('bybit', 'BTC/USD', 10, Deribit, true)

                        global.data.orders.deribit.open = true;
                        global.data.orders.deribit.type = 'long';


                        console.log('Deribit open long', Deribit)

                    }

                }

            }
        }
    }
}

exchge.balance('bybit').then(function (e) {
    console.log('ByBit Balance', e.BTC.total)
})

exchge.balance('deribit').then(function (e) {
    console.log('Deribit Balance', e.BTC.total)
})

// exchge.positions('bybit').then(function (e) {
//     for (const order of e) {
//
//         exchge.close('bybit', order.info.order_id).then(function(e) {
//             console.log(e)
//         }).catch(function() {
//             console.log('Close position error')
//         })
//
//     }
// })

// Функция для цниверсального подключения к сокет соеденениям бирж
function exchange_wss (wss='wss://', send="", callback=null, recursion=false, callback_on_update = false) {

    const client = new W3CWebSocket(wss);

    client.onerror = function() { throw 'Connection Error'; };
    client.onclose = function() { throw 'Client Closed'; };
    client.onopen = function() { client.send(send); };
    client.onmessage = function(e) { callback(e.data); if (recursion) { client.send(send); } if (callback_on_update) {callback_on_update(e.data)} };

}

// ByBit Socket
exchange_wss('wss://stream-testnet.bybit.com/realtime', JSON.stringify({
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
exchange_wss('wss://test.deribit.com/ws/api/v1/', JSON.stringify({
    "action": "/api/v1/public/index"
}), function (e=null) {

    let response = JSON.parse(e);

    if ('success' in response && response.success == true && 'result' in response) {
        global.data.price.deribit.btc = response.result.btc;
    }

}, true, callback.on.update_price)
