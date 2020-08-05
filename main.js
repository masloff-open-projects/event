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

const exchange = new stream_exchange (keypair.bybit, keypair.deribit);
const wsse = new stream_wss_events ();
const wss_tunnel = new stream_socket (wss, function (e) { return wsse.wss (e, wsse); })
const a = new stream_actions ();
const local = new stream_data ();
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
global.big_data = {
    priceHistory: {},
    volumeHistory: {},
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

wsse.register('price', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(global.data.price);
        })
    ]);
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

            if(e.data.deltas != 'false' && e.data.deltas != false) { returnData['deltas'] = indicators.delta(); }
            if(e.data.SMA.exchange != 'false' && e.data.SMA.exchange != false) { returnData['SMA'] = indicators.SMA(e.data.SMA.exchange, e.data.SMA.period); }

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
            resolve(global.data.liquidation);
        })
    ]);
});

wsse.register('ordersBook', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(local.get(`book/${e.data.exchange}/${e.data.symbol}`))
        })
    ]);
});

wsse.register('priceHistory', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {

            if ('data' in e && e.data) {
                var returnData = {};
                for (const exchange in e.data) {
                    if (e.data[exchange] != false && e.data[exchange] != "false") {
                        returnData[exchange] = exchange in global.big_data.priceHistory ? global.big_data.priceHistory[exchange] : []
                    }
                }
                resolve(returnData);
            } else {
                resolve(global.big_data.priceHistory);
            }
        })
    ]);
});

wsse.register('volumeHistory', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(global.big_data.volumeHistory)
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

/**
 * Positions streamer
 */

setInterval(function () {

    Promise.all([
        exchange.positions('bybit'),
        exchange.positions('deribit')
    ]).then(function ([bybit, deribit]) {

        /**
         * Стандартизация ...
         */

        var positions = {
            bybit: [],
            deribit: []
        };

        if (bybit.ret_msg == 'ok') {

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

        if ('result' in deribit) {

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

}, 1900);


/**
 * Price history recorder
 */

setInterval(function (e=null) {

    const time = Math.round(+new Date()/1000);

    for (const e in global.data.price) {
        let price = global.data.price[e];

        for (const symbol in price) {
            let value = price[symbol];

            if (!(e in global.big_data.priceHistory)) { global.big_data.priceHistory[e] = {}; global.big_data.priceHistory[e].btc = [] }
            if (global.big_data.priceHistory[e][symbol].length > 8000) { global.big_data.priceHistory[e][symbol].shift() }

            if (value) {
                global.big_data.priceHistory[e][symbol].push({time: time, value: value});
            }
        }

    }
}, 1000);


/**
 * Deltas recorder
 */

setInterval(function (e=null) {

    var delta = indicators.delta();
    for (const e_ in delta) {
        for (const e__ in delta[e_]) {
            if (e__ != e_) {
                let value = delta[e_][e__];

                for (const type in value) {
                    if (typeof value[type] == typeof "" || typeof value[type] == typeof 0 || typeof value[type] == typeof 0.0) {
                        csv.open(`db/indicators_${e__}_${e_}_${type}.csv`);
                        csv.write([
                            value.delta
                        ]);
                    }
                }
            }
        }
    }

}, 1000)


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