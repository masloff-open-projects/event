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

const fs = require ('fs');
const dotenv = require('dotenv');
const http = require('http');
const express = require('express');
const bittrex = require('node-bittrex-api');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const WebSocketServer = require('websocket').server;
const BitMEXClient = require('bitmex-realtime-api');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvPositions = createCsvWriter({
    path: 'db/positions.csv',
    header: ['exchange', 'side', 'size']
});
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
    positions: {
        bybit: [],
        deribit: [],
        bitmex: [],
        bittrex: []
    },
    indicators: {
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
global.vm_context = {
    env: process.env,
    UI: {
        text: "",
        error: "",
        console: [],
        set: function (e) {
            this.text = e;
        },
        log: function (e) {
            this.console.unshift({
                message: e,
                time: new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"),
                type: 'message'
            });
            if (this.console.length > 52) { this.console.pop(); }
        },
        err: function (e) {
            this.console.unshift({
                message: e,
                time: new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1"),
                type: 'error'
            });
            if (this.console.length > 52) { this.console.pop(); }
        },
        clearConsole: function () {
            this.console = [];
        },
        chart: {
            markers: [],
            marker: function (text='Marker') {
                const time = Math.round(+new Date()/1000);
                this.markers.push({ time: time, position: 'aboveBar', color: '#0074f6', shape: 'arrowDown', text: text });
                if (this.markers.length > 52) { this.markers.shift(); }
            }
        }
    },
    "$": {
        _: {
            wait: false
        },
        sleep: function (ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        wait: function (ms) {
            const date = Date.now();
            let currentDate = null;
            do {
                currentDate = Date.now();
            } while (currentDate - date < ms);
        },
        mwait: function (ms, callback) {
           if ('mwait_session' in global && global.mwait_session) {

           } else {
               callback();
               global.mwait_session = true;
               setTimeout(function (){
                   global.mwait_session = false
               }, ms);
           }
        }
    },
    telegram: telegram,
    len: (e) => {
        return (e ? e : []).length;
    },
    havePosition: (e, side='Sell') => {
        if (e != []) {
            for (const P of e) {
                if ('side' in P && P.side == side) {
                    return P;
                }
            }
        }

        return false;
    },
    indicators: function () {
        return global.data.indicators;
    },
    time: function () { parseInt(new Date().getTime()/1000) },
    data: function () {
        return global.data;
    },
    bybit: {
        price: () => {
            return global.data.price.bybit;
        },
        positions: () => {
            return global.data.positions.bybit;
        },
        volume: () => {
            return global.data.size.bybit;
        },
        buy: (price=false, qty=process.env.CAPITAL, symbol='BTCUSD') => {
            if (price) {
                return exchange.limit('bybit', 'Buy', symbol, qty, price);
            } else {
                return exchange.market('bybit', 'Buy', symbol, qty);
            }
        },
        sell: function (price=false, qty=process.env.CAPITAL, symbol='BTCUSD') {
            if (price) {
                return exchange.limit('bybit', 'Sell', symbol, qty, price);
            } else {
                return exchange.market('bybit', 'Sell', symbol, qty);
            }
        }
    },
    deribit: {
        price: () => {
            return global.data.price.deribit;
        },
        positions: () => {
            return global.data.positions.deribit;
        },
        volume: () => {
            return global.data.size.deribit;
        },
        buy: function (price=false, qty=process.env.CAPITAL, symbol='BTC-PERPETUAL') {
            if (price) {
                return exchange.limit('deribit', 'Buy', symbol, qty, price);
            } else {
                return exchange.market('deribit', 'Buy', symbol, qty);
            }
        },
        sell: function (price=false, qty=process.env.CAPITAL, symbol='BTC-PERPETUAL') {
            if (price) {
                return exchange.limit('deribit', 'Sell', symbol, qty, price);
            } else {
                return exchange.market('deribit', 'Sell', symbol, qty);
            }
        },
    },
    bittrex: {
        price: () => {
            return global.data.price.bittrex;
        },
        positions: () => {
            return global.data.positions.bittrex;
        },
        volume: () => {
            return global.data.size.bittrex;
        }
    },
    bitmex: {
        price: () => {
            return global.data.price.bitmex;
        },
        positions: () => {
            return global.data.positions.bitmex;
        },
        volume: () => {
            return global.data.size.bitmex;
        }
    }
}
global.vm_scripts = {
    init: fs.readFileSync(__dirname + "/scripts/init.js"),
    everyPrice: fs.readFileSync(__dirname + "/scripts/everyPrice.js"),
    everyPriceWait: fs.readFileSync(__dirname + "/scripts/everyPriceWait.js")
}
global.big_data = {
    priceHistory: {},
    volumeHistory: {},
}

const e = new stream_events ();

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

    /**
     * Get price form Deribit
     */

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


    /**
     * Get volumes from Deribit
     */

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
                UI: global.vm_context.UI
            });
        })
    ]);
});

wsse.register('indicators', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(global.data.indicators);
        })
    ]);
});

wsse.register('positions', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {

            var response = [];

            for (const position of global.data.positions.bybit) {response.push(position)}
            for (const position of global.data.positions.deribit) {response.push(position)}

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

wsse.register('orders', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(global.data.book)
        })
    ]);
});

wsse.register('priceHistory', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve(global.big_data.priceHistory)
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


setInterval(function () {

    Promise.all([
        exchange.positions('bybit'),
        exchange.positions('deribit')
    ]).then(function ([bybit, deribit]) {

        /**
         * Стандартизация ...
         */

        if (bybit.ret_msg == 'ok') {

            global.data.positions.bybit = [];

            for (const position of bybit.result) {
                if (position.size > 0) {

                    let data = {
                        exchange: 'ByBit',
                        symbol: position.symbol,
                        side: position.side,
                        size: position.size,
                        leverage: position.leverage,
                        take_profit: position.take_profit,
                        stop_loss: position.stop_loss,
                        pnl: position.realised_pnl,
                        created_at: position.created_at,
                        fee: position.occ_closing_fee,
                        margin: position.position_margin,
                        liq: position.liq_price,
                    };

                    global.data.positions.bybit.push(data);
                }
            }

        }

        // For of Deribit positions
        if ('result' in deribit) {

            global.data.positions.deribit = [];

            for (const position of deribit.result) {
                if (position.size > 0) {

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

                    global.data.positions.deribit.push(data);
                }
            }

        }

    });

}, 2000);


/**
 * Register telegram events
 */

telegram.register('/pnl', function () {

});

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/html/index.html");
});

app.get('/code', function (req, res) {
    res.sendFile(__dirname + "/html/logic.html");
});

app.get('/get/script/user', function (req, res) {
    res.sendFile(__dirname + "/scripts/user.js");
});

app.post('/set/script/user', function (req, res) {
    if ('code' in req.body) {
        fs.writeFileSync(__dirname + "/scripts/user.js", req.body.code)
    }
    res.sendStatus(200);
});