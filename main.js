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
const level = require('level')
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
const db = level('db/default')
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
        len: (e) => {
            return e.length;
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
    tlg: telegram,
    bybit: {
        positions: [],
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
        positions: [],
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
    }
}
global.vm_scripts = {
    init: fs.readFileSync(__dirname + "/scripts/init.js"),
    everyPrice: fs.readFileSync(__dirname + "/scripts/everyPrice.js"),
    everyPriceWait: fs.readFileSync(__dirname + "/scripts/everyPriceWait.js")
}

const e = new stream_events ();

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
    every: e.price
}, false);
stream_wws (process.env.WWS_DERIBIT, JSON.stringify({
    "jsonrpc": "2.0",
    "method": "public/get_index",
    "id": 12,
    "params": {
        "currency": "BTC"
    }
}), {
    onmessage: function (e=null) {

        let response = JSON.parse(e);

        if ('id' in response && response.id == 12 && 'result' in response) {
            global.data.price.deribit.btc = response.result.BTC;
        }

    },
    every: e.price
}, true);
stream_wws (process.env.WWS_DERIBIT, JSON.stringify({
    "jsonrpc" : "2.0",
    "id" : 9290,
    "method" : "public/get_last_trades_by_currency",
    "params" : {
        "currency" : "BTC",
        "count" : 10
    }
}), {
    onmessage: function (e=null) {

        let response = JSON.parse(e);

        for (const position of response.result.trades) {
            global.data.size.deribit.btc = {
                size: position.amount,
                side: position.direction == 'sell' ? 'Sell' : 'Buy',
            };
        }

    }
}, true);
bittrex.websockets.listen(function(data, client) {
    if (data.M === 'updateSummaryState') {
        data.A.forEach(function(data_for) {
            data_for.Deltas.forEach(function(marketsDelta) {
                if (marketsDelta.MarketName == 'USDT-BTC') {
                    if ('Last' in marketsDelta) {
                        global.data.price.bittrex.btc = marketsDelta.Last;
                        e.price();
                    }
                }
            });
        });
    }
});
bmc.addStream('XBTUSD', 'trade', function (data, symbol, tableName) {
    if (!data.length) return;
    const operate = data[0];

    global.data.price.bitmex.btc = operate.price;
    global.data.size.bitmex.btc = {
        size: operate.size,
        side: operate.side,
    };

    e.price();

});
bmc.addStream('XBTUSD', 'liquidation', function (data, symbol, tableName) {
    if (!data.length) return;
    const operate = data[0];

    global.data.liquidation.bitmex = operate;

});
bmc.addStream('XBTUSD', 'orderBook10', function (data, symbol, tableName) {
    if (!data.length) return;
    const operate = data[0];
    global.data.book.bitmex.asks = operate.asks;
    global.data.book.bitmex.bids = operate.bids;

});

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

telegram.listen();

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