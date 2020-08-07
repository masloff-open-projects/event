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
const stream_cron = require('./lib/cron.js');

const init_express = require('./init/express.js');
const init_telegram = require('./init/telegram.js');
const init_wsse = require('./init/wsse.js');
const init_indicators = require('./init/indicators.js');

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
const {TwingEnvironment, TwingLoaderFilesystem} = require('twing');

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
const wss_tunnel = new stream_socket (wss, function (e, io) { return wsse.wss (e, wsse, io); })
const actions = new stream_actions ();
const csv = new stream_csv ();
const cron = new stream_cron ();
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

const loader = new TwingLoaderFilesystem('./html');
const twing = new TwingEnvironment(loader);

app.use(basicAuth({users: {'trader': 'QmHLY3IlrEkRgR82', 'root': 'root'}, challenge: true, realm: 'Imb4T3st4pp'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));

const virtualEnv = new stream_vm ({
    local: local,
    exchange: exchange,
    telegram: telegram,
    indicators: indicators,
    csv: csv
});

virtualEnv.init();

const e = new stream_events (virtualEnv, local);

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
            every: function (event=null) {
                let response = JSON.parse(event);
                if ('data' in response && 'topic' in response && response.topic == 'trade.BTCUSD') {
                    e.price('bybit', response.data[0].price, 'BTC')
                    e.volume ('bybit', {
                        size: response.data[0].size,
                        side: response.data[0].side,
                    }, 'BTC')
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

        // Get orderBook and price from Deribit
        stream_wws (process.env.WWS_DERIBIT, JSON.stringify({
            "jsonrpc" : "2.0",
            "id" : 9290,
            "method" : "public/get_order_book",
            "params" : {
                "instrument_name" : "BTC-PERPETUAL",
                "depth" : 5
            }
        }), {
            every: function (event=null) {
                let response = JSON.parse(event);

                if ('result' in response && response.result) {
                    e.book('deribit', {
                        asks: response.result.asks,
                        bids: response.result.bids,
                        minPrice: response.result.min_price,
                        maxPrice: response.result.max_price,
                    }, 'BTC');

                    e.price ('deribit', response.result.index_price, 'BTC')
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

cron.register('* * * * * *', function () {

    // Reauth on Deribit
    (async function () {
        exchange.auth('deribit');
    }) ();

});

cron.register('* * * * * *', function () {

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

            local.append(`exchange/clearHistory/price/${symbol}/${exchange}`, price);
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

});

init_express (app, twing, fs);
init_telegram (telegram);
init_indicators (indicators, local, exchange);
init_wsse (wsse, exchange, wss_tunnel, virtualEnv, indicators, local);
