const ccxt = require ('ccxt');
const W3CWebSocket = require('websocket').w3cwebsocket;
const fs = require ('fs');
const {RestClient} = require('@pxtrn/bybit-api');
const dotenv = require('dotenv');
dotenv.config();

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

const exchange = {
    bybit: {
        balance: function (e, coin='BTC') {
            const client = new RestClient(e.apiKey, e.secret, !e.testnet);
            return client.getWalletBalance({
                coin: coin
            });
        },
        limit:function (e, side='Sell', symbol='BTCUSD', qty=0, price=0, take_profit=0, stop_loss=0, time_in_force='GoodTillCancel', reduce_only=false, close_on_trigger=false) {
            const client = new RestClient(e.apiKey, e.secret, !e.testnet);

            params = {
                side: side,
                symbol: symbol,
                order_type: "Limit",
                qty: qty,
                price: price,
                time_in_force: 'GoodTillCancel',
                close_on_trigger: close_on_trigger,
                reduce_only: reduce_only
            };

            if (stop_loss) {params['stop_loss'] = stop_loss;}
            if (take_profit) {params['take_profit'] = take_profit;}

            return client.placeActiveOrder(params);
        },
        market:function (e, side='Sell', symbol='BTCUSD', qty=0, take_profit=0, stop_loss=0, time_in_force='GoodTillCancel', reduce_only=false, close_on_trigger=false) {
            const client = new RestClient(e.apiKey, e.secret, !e.testnet);

            params = {
                side: side,
                symbol: symbol,
                order_type: "Market",
                qty: qty,
                time_in_force: 'GoodTillCancel',
                close_on_trigger: close_on_trigger,
                reduce_only: reduce_only
            };

            if (stop_loss) {params['stop_loss'] = stop_loss;}
            if (take_profit) {params['take_profit'] = take_profit;}

            return client.placeActiveOrder(params);
        }
    }
}
const keypair = {
    bybit: {
        apiKey: process.env.BYBIT_APIKEY,
        secret: process.env.BYBIT_SECRET,
        testnet: process.env.TESTNET == 'false' ? false : true
    }
}

// exchange.bybit.balance(keypair.bybit).then(function(e) {
//     console.log(e);
// })

// exchange.bybit.limit(keypair.bybit, 'Sell', 'BTCUSD', 5, 14000).then(function(e) {
//     console.log(e);
// })

// exchange.bybit.market(keypair.bybit, 'Buy', 'BTCUSD', 10000).then(function(e) {
//     console.log(e);
// })

// Набор функций для обработки состояний
const callback = {
    on: {

        // Вызывается при каждом тике обновления цены
        update_price: function () {

            // Создаем окружение переменных
            let ByBit = global.data.price.bybit.btc;
            let Deribit = global.data.price.deribit.btc;
            let Delta = ByBit - Deribit;

            // Проверяем, загрузились ли балансы
            if (ByBit && Deribit) {
                console.log(ByBit, Deribit, Delta)

                fs.appendFileSync('exchange.csv', `${ByBit};${Deribit};${Delta}\n`);

                // Если дельта больше 1, то это значит, что на бирже ByBit  цена выше, чем на Deribit
                if (Delta > 1) {

                    // Проверяем, открыты ли ордера.
                    // Без проверки мы может наплодить сотни ордеров, так-как эта функция вызывается больше раза в секунду

                    if (!(process.env.SAFE == 'false' ? false : true)) {

                        if (!global.data.orders.bybit.open) {

                            // Записываем текущее состояние
                            global.data.orders.bybit.open = true;
                            global.data.orders.bybit.type = 'short';

                            exchange.bybit.market(keypair.bybit, 'Sell', 'BTCUSD', process.env.CAPITAL).then(function(e) {
                                if ('ret_msg' in e && e.ret_msg == 'OK') {
                                    console.log(e)
                                }
                            })

                        }

                        if (!global.data.orders.deribit.open) {

                            // Записываем текущее состояние
                            global.data.orders.deribit.open = true;
                            global.data.orders.deribit.type = 'long';


                            console.log('Deribit open long', Deribit)

                        }

                    } else {
                        if (global.data.orders.bybit.open) {

                            // Записываем текущее состояние
                            global.data.orders.bybit.open = false;
                            global.data.orders.bybit.type = 'short';

                            exchange.bybit.market(keypair.bybit, 'Buy', 'BTCUSD', process.env.CAPITAL).then(function(e) {
                                if ('ret_msg' in e && e.ret_msg == 'OK') {
                                    console.log(e)
                                }
                            })

                        }
                    }

                }

            }
        }
    }
}

// Функция для универсального подключения к сокет соеденениям бирж
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