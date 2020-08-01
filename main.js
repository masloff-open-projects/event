/**
 * Торговый терминал.
 * Терминал поддерживает функции программирования действий.
 */

const stream_wws = require('./lib/exchange_wws.js');
const stream_exchange = require('./lib/exchange.js');
const stream_events = require('./lib/events.js');
const stream_wss_events = require('./lib/wss_events.js');
const stream_socket = require('./lib/socket.js');

const dotenv = require('dotenv');
const http = require('http');
const express = require('express');
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const WebSocketServer = require('websocket').server;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({httpServer: server});

dotenv.config();
server.listen(4556, '0.0.0.0',function() { });

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
const e = new stream_events ();
const wsse = new stream_wss_events ();
const wss_tunnel = new stream_socket (wss, function (e) { return wsse.wss (e, wsse); })

const fs = require ('fs');

app.use(basicAuth({users: {'trader': 'QmHLY3IlrEkRgR82'}, challenge: true, realm: 'Imb4T3st4pp'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

global.data = {
    price: {
        bybit: {
            btc: 0
        },
        deribit: {
            btc: 0
        }
    },
    size: {
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
    },
    positions: {
        bybit: [],
        deribit: []
    }
}
global.vm_context = {
    UI: {
        text: "",
        error: "",
        console: [],
        send: function (e) {
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
        len: (e) => {
            return e.length;
        },
        sleep: function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    },
    e: {
        bybit: {
            buy: function (price=false, qty=process.env.CAPITAL, symbol='BTCUSD') {
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
            },
        },
        deribit: {
            buy: function (price=false, qty=process.env.CAPITAL, symbol='BTCUSD') {
                if (price) {
                    return exchange.limit('deribit', 'Buy', symbol, qty, price);
                } else {
                    return exchange.market('deribit', 'Buy', symbol, qty);
                }
            },
            sell: function (price=false, qty=process.env.CAPITAL, symbol='BTCUSD') {
                if (price) {
                    return exchange.limit('deribit', 'Sell', symbol, qty, price);
                } else {
                    return exchange.market('deribit', 'Sell', symbol, qty);
                }
            },
        }
    }
}

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
    "action": "/api/v1/public/index"
}), {
    onmessage: function (e=null) {

        let response = JSON.parse(e);

        if ('success' in response && response.success == true && 'result' in response) {
            global.data.price.deribit.btc = response.result.btc;
        }

    },
    every: e.price
}, true);

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
            resolve(global.vm_context);
        })
    ]);
});

wsse.register('delta', function (e) {
    return Promise.all([
        new Promise((resolve, reject) => {
            resolve({
                delta: global.data.price.bybit.btc - global.data.price.deribit.btc,
                delta_abs: Math.abs(global.data.price.bybit.btc - global.data.price.deribit.btc),
                delta_average: (global.data.price.bybit.btc + global.data.price.deribit.btc) / 2,
                delta_procent: {
                    a: (((global.data.price.deribit.btc-global.data.price.bybit.btc)/global.data.price.bybit.btc) * 100) / -1
                }
            });
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