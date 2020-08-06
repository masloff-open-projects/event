/**
 * Торговый терминал.
 * Терминал поддерживает функции программирования действий.
 */

const stream_wws = require('./lib/exchange_wws.js');
const stream_exchange = require('./lib/exchange.js');
const stream_events = require('./lib/events.js');
const stream_wss_events = require('./lib/wss_events.js');
const stream_socket = require('./lib/socket.js');
const stream_actions = require('./lib/actions.js');
const stream_telegram = require('./lib/telegram.js');
const stream_data = require('./lib/data.js');
const stream_indicators = require('./lib/indicators.js');
const stream_csv = require('./lib/csv.js');
const stream_vm = require('./lib/VM.js');

const fs = require ('fs');
const dotenv = require('dotenv');
const http = require('http');
const express = require('express');
const bittrex = require('node-bittrex-api');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const WebSocketServer = require('websocket').server;
const BitMEXClient = require('bitmex-realtime-api');
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({httpServer: server});
const cron = require('cron').CronJob;

dotenv.config();
server.listen(process.env.PORT, process.env.IP,function() { });

const keypair = {
    bybit: {
        apiKey: process.env.BYBIT_APIKEY,
        secret: process.env.BYBIT_SECRET,
        testnet: process.env.TESTNET == 'false' ? false : true
    },
    deribit: {
        apiKey: "A1pCeNpp",
        secret: "dD_81yOvEPM3IchPmaQTZdJp-nqaK5c-LekGLM1UVRA",
        testnet: process.env.TESTNET == 'false' ? false : true
    }
};

const local = new stream_data ();
const exchange = new stream_exchange (keypair.bybit, keypair.deribit, local);
const wsse = new stream_wss_events ();
const wss_tunnel = new stream_socket (wss, function (e) { return wsse.wss (e, wsse); })
const actions = new stream_actions ();
const csv = new stream_csv ();
const indicators = new stream_indicators ();
const telegram = new stream_telegram (process.env.TELEGRAM_TOKEN, [
    {
        name: 'Владислав',
        id: 1138495203
    },
    {
        name: 'Иван',
        id: 3493682
    }
]);
const bmc = new BitMEXClient({testnet: !process.env.TESTNET});

app.use(basicAuth({users: {'trader': 'QmHLY3IlrEkRgR82', 'root': 'root'}, challenge: true, realm: 'Imb4T3st4pp'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

global.data = {
    price: {
        bybit: {
            btc: 0
        },
        deribit: {
            btc: 0
        },
        bitmex: {
            btc: 0
        },
        bittrex: {
            btc: 0
        }
    },
    size: {
        bybit: {
            btc: 0
        },
        deribit: {
            btc: 0
        },
        bitmex: {
            btc: 0
        },
        bittrex: {
            btc: 0
        }
    },
    book: {
        bitmex: {
            bids: [],
            asks: []
        }
    },
    liquidation: {
        bitmex: {}
    }
}

const virtualEnv = new stream_vm ({
    local: local,
    exchange: exchange,
    telegram: telegram,
    indicators: indicators,
    csv: csv
});

virtualEnv.init();

const e = new stream_events (virtualEnv, local);

virtualEnv.execute('everyPrice');

(function (e=null) {


    /**
     * ByByit connect to stream
     *
     * Get WWS from process.env.WWS_BYBIT
     * Use stream_wws
     */

    (function (e=null) {

        stream_wws (process.env.WWS_BYBIT, JSON.stringify({
            op: "subscribe",
            args: [
                "trade.BTCUSD"
            ]
        }), {
            onmessage: function (e=null) {

                let response = JSON.parse(e);

                if ('data' in response && 'topic' in response && response.topic == 'trade.BTCUSD') {
                    global.data.price.bybit.btc = response.data[0].price;
                    global.data.size.bybit.btc = {
                        size: response.data[0].size,
                        side: response.data[0].side,
                    };
                }

            },
            every: function (event=null) {
                let response = JSON.parse(event);
                if ('data' in response && 'topic' in response && response.topic == 'trade.BTCUSD') {
                    e.price('bybit', response.data[0].price, 'BTC')
                }
            }
        }, false);

    }) (e);


    /**
     * Deribit connect to stream
     *
     * Get WSS from process.env.WWS_DERIBIT
     * Use stream_wws
     */

    (function (e=null) {


        //Get price form Deribit
        stream_wws (process.env.WWS_DERIBIT, JSON.stringify({
            "jsonrpc": "2.0",
            "method": "public/get_index",
            "id": 12,
            "params": {
                "currency": "BTC"
            }
        }), {
            every: function (event=null) {
                let response = JSON.parse(event);
                e.price ('deribit', response.result.BTC, 'BTC')
            }
        }, true);


        // Get volumes from Deribit
        stream_wws (process.env.WWS_DERIBIT, JSON.stringify({
            "jsonrpc" : "2.0",
            "id" : 9290,
            "method" : "public/get_last_trades_by_currency",
            "params" : {
                "currency" : "BTC",
                "count" : 10
            }
        }), {
            every: function (event=null) {
                let response = JSON.parse(event);
                for (const position of response.result.trades) {
                    e.volume('deribit', {
                        size: position.amount,
                        side: position.direction == 'sell' ? 'Sell' : 'Buy',
                    }, 'BTC');
                }
            }
        }, true);

    }) (e);


    /**
     * Bittrex connect to stream
     *
     * Use bittrex.websockets
     */

    (function (e=null) {

        bittrex.websockets.listen(function(data, client) {
            if (data.M === 'updateSummaryState') {
                data.A.forEach(function(data_for) {
                    data_for.Deltas.forEach(function(marketsDelta) {
                        if (marketsDelta.MarketName == 'USDT-BTC') {
                            if ('Last' in marketsDelta) {
                                e.price ('bittrex', marketsDelta.Last, 'BTC')
                            }
                        }
                    });
                });
            }
        });

    }) (e);


    /**
     * BitMex connect to stream
     *
     * Use bmc
     */

    (function (e=null) {

        /**
         * Get real-time trade information
         */

        bmc.addStream('XBTUSD', 'trade', function (data, symbol, tableName) {
            if (!data.length) return;
            const operate = data[0];

            e.price ('bitmex', operate.price, 'BTC')
            e.volume ('bitmex', {
                size: operate.size,
                side: operate.side,
            }, 'BTC');

        });


        /**
         * Get real-time liquidation information
         */

        bmc.addStream('XBTUSD', 'liquidation', function (data, symbol, tableName) {
            if (!data.length) return;
            const operate = data[0];
            e.liquidation('bitmex', operate, 'BTC')
        });


        /**
         * Get real-time orders book
         */

        bmc.addStream('XBTUSD', 'orderBook10', function (data, symbol, tableName) {
            if (!data.length) return;
            const operate = data[0];
            e.book('bitmex', {
                asks: operate.asks,
                bids: operate.bids
            }, 'BTC');
        });

    }) (e);

}) (e);

indicators.register('delta', function (e=null) {

    /**
     * Get a delta between two specific exchanges.
     *
     * @param exchange_1
     * @param exchange_2
     * @returns {{}}
     */

    if ((typeof e == typeof {}) && ('symbol' in e && 'e1' in e && 'e2' in e)) {

        const price1 = local.get(`exchange/real/price/${e.symbol}/${e.e1}`);
        const price2 = local.get(`exchange/real/price/${e.symbol}/${e.e2}`);

        return parseFloat(price1) - parseFloat(price2)

    } else {

        var returnData = {};
        const priceData = local.list('exchange/real/price/', false);

        for (const _ in priceData) {

            const price = priceData[_];
            const symbol = _.toLowerCase().split('/')[0];
            const exchange = _.toLowerCase().split('/')[1];

            for (const __ in priceData) {

                const price__ = priceData[__];
                const symbol__ = __.toLowerCase().split('/')[0];
                const exchange__ = __.toLowerCase().split('/')[1];

                if (exchange != exchange__) {

                    (exchange in returnData ? null : returnData[exchange] = {});
                    returnData[exchange][exchange__] = price - price__;

                }

            }

        }

        return returnData;

    }

});

indicators.register('percent', function (e=null) {

    /**
     * Get a percent between two specific exchanges.
     *
     * @param exchange_1
     * @param exchange_2
     * @returns {{}}
     */

    if ((typeof e == typeof {}) && ('symbol' in e && 'e1' in e && 'e2' in e)) {

        const price1 = local.get(`exchange/real/price/${e.symbol}/${e.e1}`);
        const price2 = local.get(`exchange/real/price/${e.symbol}/${e.e2}`);

        return (parseInt(price1) - parseInt(price2)/parseInt(price1)) * 100;

    } else {

        var returnData = {};
        const priceData = local.list('exchange/real/price/', false);

        for (const _ in priceData) {

            const price = priceData[_];
            const symbol = _.toLowerCase().split('/')[0];
            const exchange = _.toLowerCase().split('/')[1];

            for (const __ in priceData) {

                const price__ = priceData[__];
                const symbol__ = __.toLowerCase().split('/')[0];
                const exchange__ = __.toLowerCase().split('/')[1];

                if (exchange != exchange__) {

                    (exchange in returnData ? null : returnData[exchange] = {});
                    returnData[exchange][exchange__] = (parseInt(price) - parseInt(price__)/parseInt(price)) * 100;

                }

            }

        }

        return returnData;

    }

});

wsse.register('size', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(global.data.size);
        })
    ]);
});

wsse.register('balance', function (e) {
    return Promise.all([
        exchange.balance('bybit'),
        exchange.balance('deribit')
    ]);
});

wsse.register('connections', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {

            var device = [];

            for (const connection of wss_tunnel.connections()) {
                device.push({
                    ip: connection.remoteAddress
                });
            }

            resolve(device);
        })
    ]);
});

wsse.register('console', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve({
                UI: virtualEnv.currentContext().UI
            });
        })
    ]);
});

wsse.register('indicators', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {

            var returnData = {};

            if ('data' in e && e.data) {
                for (const indicator of e.data) {
                    returnData[indicator.name] = indicators.call(indicator.name, {});
                }
            }

            resolve(returnData);
        })
    ]);
});

wsse.register('positions', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {

            var response = [];

            for (const position of (local.get('positions/deribit') ? local.get('positions/deribit') : [{}])) {response.push(position)}
            for (const position of (local.get('positions/bybit') ? local.get('positions/bybit') : [{}])) {response.push(position)}

            resolve(response);
        })
    ]);
});

wsse.register('liquidations', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(local.list('exchange/liquidation/real/', false));
        })
    ]);
});

wsse.register('ordersBook', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(local.get(`exchange/book/real/${e.data.symbol}/${e.data.exchange}`))
        })
    ]);
});

wsse.register('priceHistory', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {

            if ('data' in e && e.data) {

                var returnData = {};
                const historyData = local.list('exchange/history/price/', false);

                for (const _ in historyData) {

                    const history = historyData[_];
                    const symbol = _.toLowerCase().split('/')[0];
                    const exchange = _.toLowerCase().split('/')[1];

                    if (symbol === e.data.symbol && (exchange in e.data.exchanges && (e.data.exchanges[exchange] !== 'false' && e.data.exchanges[exchange] !== false)) ) {

                        const priceData = local.list(`exchange/real/price/${symbol}/`, false);

                        (exchange in returnData ? null : returnData[exchange] = {history: {}, price: {}});

                        returnData[exchange]['history'] = history;
                        returnData[exchange]['price'] = priceData[exchange];

                    }

                }

                resolve(returnData);

            } else {

                resolve(local.list('exchange/history/price/', false));

            }
        })
    ]);
});

wsse.register('volumeHistory', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(local.get(`exchange/history/volume/${e.data.symbol}/${e.data.exchange}`))
        })
    ]);
});

wsse.register('openMarketPosition', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            let data = e.data;
            resolve(exchange.market(data.exchange, data.side, data.symbol, data.size))
        })
    ]);
});

wsse.register('disconnectIP', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(wss_tunnel.disconnect(e.data.ip))
        })
    ]);
});

(new cron('* * * * * *', function() {

    // Record price
    (async function (e=null) {

        const time = Math.round(+new Date()/1000);
        const data = local.list('exchange/real/price/', false);

        for (const _ in data) {

            const price = data[_];
            const symbol = _.toLowerCase().split('/')[0];
            const exchange = _.toLowerCase().split('/')[1];

            local.append(`exchange/history/price/${symbol}/${exchange}`, {
                time: time,
                value: price
            });
        }

    }) ();

    // Record deltas
    (async function () {

    }) ();

    // Record volume history
    (async function () {

        const time = Math.round(+new Date()/1000);
        const data = local.list('exchange/real/volume/', false);

        for (const _ in data) {

            const volume = data[_];
            const symbol = _.toLowerCase().split('/')[0];
            const exchange = _.toLowerCase().split('/')[1];

            local.append(`exchange/history/volume/${symbol}/${exchange}`, {
                time: time,
                value: 'size' in volume ? volume.size : 0,
                color: ('side' in volume ? volume.side : 'Sell') == 'Buy' ? 'rgba(121, 184, 61, 0.3)' : 'rgba(188, 71, 103, 0.3)'
            });

        }

    }) ();

    // Get positions
    (async function () {
        
        /**
         * Warning!
         * BybBit accepts the list of positions not only by this method!
         * Positions on ByBit exchange are updated in two methods!
         * See the constructor of `exchange` class and CronTab task in main.
         */
        
        Promise.all([
            exchange.positions('bybit'),
            exchange.positions('deribit'),
        ]).then(function ([bybit, deribit]) {

            var positions = {
                bybit: [],
                deribit: []
            };

            if (bybit.ret_msg == 'ok' && (Symbol.iterator in Object(bybit.result))) {

                for (const position of bybit.result) {
                    if (position.size != 0) {

                        let data = {
                            exchange: 'ByBit',
                            symbol: position.symbol,
                            side: position.side,
                            size: position.size,
                            leverage: position.leverage,
                            take_profit: position.take_profit,
                            stop_loss: position.stop_loss,
                            pnl: position.unrealised_pnl,
                            created_at: position.created_at,
                            fee: position.occ_closing_fee,
                            margin: position.position_margin,
                            liq: position.liq_price,
                        };
                        positions.bybit.push(data);
                    }
                }

            }

            if ('result' in deribit && deribit.result && (Symbol.iterator in Object(deribit.result))) {
                for (const position of deribit.result) {
                    if (position.size != 0) {
                        let data = {
                            exchange: 'Deribit',
                            symbol: position.instrument_name,
                            side: position.direction == 'buy' ? 'Buy' : 'Sell',
                            size: position.size,
                            leverage: position.leverage,
                            take_profit: false,
                            stop_loss: false,
                            pnl: position.total_profit_loss,
                            created_at: false,
                            fee: false,
                            margin: position.initial_margin,
                            liq: position.estimated_liquidation_price
                        };

                        positions.deribit.push(data);
                    }
                }
            }

            local.set('positions/bybit', positions.bybit);
            local.set('positions/deribit', positions.deribit);

        });

    }) ();

}, null, true, 'America/Los_Angeles')).start();

(new cron('*/10 * * * *', function() {

    // Reauth on Deribit
    (async function () {
        exchange.auth('deribit');
    }) ();

}, null, true, 'America/Los_Angeles')).start();


/**
 * Register telegram events
 */

telegram.register('/pnl', function () {

});

telegram.on('polling_error', function () {});
telegram.on('webhook_error', function () {});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/html/index.html");
});

app.get('/code', function (req, res) {
    res.sendFile(__dirname + "/html/logic.html");
});

app.get('/get/script/user', function (req, res) {
    res.sendFile(__dirname + "/scripts/user.js");
});

app.get('/view/:file', function (req, res) {
    res.sendFile(__dirname + "/html/csv.html");
})

app.get('/file/:file', function (req, res) {
    res.sendFile(__dirname + "/db/" + req.params.file);
})

app.post('/set/script/user', function (req, res) {
    if ('code' in req.body) {
        fs.writeFileSync(__dirname + "/scripts/user.js", req.body.code);
        res.sendStatus(200);
    }
});