/**
 * Class for working with virtual environment.
 * It creates a virtual environment and is a
 * bridge between the terminal and the firmware.
 *
 * @version: 1.0.0
 */

class VM {

    constructor (packageData, reBuildIfChange=true) {

        global.virtual_context = {};
        this.source = __dirname + "/../scripts/user.js";
        this.local = packageData.local;
        this.exchange = packageData.exchange;
        this.indicators = packageData.indicators;
        this.telegram = packageData.telegram;
        this.csv = packageData.csv;
        this.actions = packageData.actions;
        this.vm = require('vm');
        this.fs = require ('fs');
        this.request = require('sync-request');

        if (reBuildIfChange) {
            this.fs.watchFile(this.source, (curr, prev) => {
                this.init()
            });
        }

    }

    /**
     * Function of the first initialization
     * of the environment and the virtual environment in general
     */

    init () {

        global.virtual_context = this.build();

        this.vm.createContext(global.virtual_context)
        this.execute('boot');
        this.execute('user');
        this.execute('init');

        return true;

    }


    /**
     * Function for script execution from script library
     */

    execute (script='') {
        
        try {
            ((script in this.lib()) ? this.lib()[script].runInContext(global.virtual_context) : false)
        } catch (e) {
            global.virtual_context.UI.error = e.message;
        }
        
    }


    /**
     * Assembling the orchestral environment and sending
     * them as a function response
     *
     * @returns {any}
     */

    build () {

        var local = this.local;
        var exchange = this.exchange;
        var telegram = this.telegram;
        var indicators = this.indicators;
        var csv = this.csv;
        var actions = this.actions;
        var request = this.request;
        var fs = this.fs;

        return {
            bybit: {
                price: function (c='btc') {
                    return local.get(`exchange/real/price/${c}/bybit`);
                },
                positions: () => {
                    return local.get('positions/bybit');
                },
                volume: () => {
                    return global.data.size.bybit;
                },
                buy: (price=false, qty=process.env.CAPITAL, symbol='BTCUSD') => {
                    if (price) {

                        csv.open(process.cwd() + '/db/positions.csv');
                        csv.write([
                            'ByBit',
                            parseInt(new Date().getTime()/1000),
                            'Buy',
                            price,
                            qty,
                            symbol
                        ]);

                        return exchange.limit('bybit', 'Buy', symbol, qty, price);
                    } else {

                        csv.open(process.cwd() + '/db/positions.csv');
                        csv.write([
                            'ByBit',
                            parseInt(new Date().getTime()/1000),
                            'Buy',
                            'Market',
                            qty,
                            symbol
                        ]);

                        return exchange.market('bybit', 'Buy', symbol, qty);
                    }
                },
                sell: function (price=false, qty=process.env.CAPITAL, symbol='BTCUSD') {
                    if (price) {

                        csv.open(process.cwd() + '/db/positions.csv');
                        csv.write([
                            'ByBit',
                            parseInt(new Date().getTime()/1000),
                            'Sell',
                            price,
                            qty,
                            symbol
                        ]);

                        return exchange.limit('bybit', 'Sell', symbol, qty, price);
                    } else {

                        csv.open(process.cwd() + '/db/positions.csv');
                        csv.write([
                            'ByBit',
                            parseInt(new Date().getTime()/1000),
                            'Sell',
                            'Market',
                            qty,
                            symbol
                        ]);

                        return exchange.market('bybit', 'Sell', symbol, qty);
                    }
                },
                editOrder: function () { return false; },
                orders: function () { return false; },
                cancelAll: function () { return false; },
                getDepositAddress: function () { return false; },
                getHistoricalVolatility: function () { return false; },
            },
            deribit: {
                price: function (c='btc') {
                    return local.get(`exchange/real/price/${c}/deribit`);
                },
                positions: () => {
                    return local.get('positions/deribit');
                },
                volume: () => {
                    return global.data.size.deribit;
                },
                buy: function (price=false, qty=process.env.CAPITAL, symbol='BTC-PERPETUAL') {
                    if (price) {

                        csv.open(process.cwd() + '/db/positions.csv');
                        csv.write([
                            'Deribit',
                            parseInt(new Date().getTime()/1000),
                            'Buy',
                            price,
                            qty,
                            symbol
                        ]);

                        return exchange.limit('deribit', 'Buy', symbol, qty, price);
                    } else {

                        csv.open(process.cwd() + '/db/positions.csv');
                        csv.write([
                            'Deribit',
                            parseInt(new Date().getTime()/1000),
                            'Buy',
                            'Market',
                            qty,
                            symbol
                        ]);

                        return exchange.market('deribit', 'Buy', symbol, qty);
                    }
                },
                sell: function (price=false, qty=process.env.CAPITAL, symbol='BTC-PERPETUAL') {
                    if (price) {

                        csv.open(process.cwd() + '/db/positions.csv');
                        csv.write([
                            'Deribit',
                            parseInt(new Date().getTime()/1000),
                            'Sell',
                            price,
                            qty,
                            symbol
                        ]);

                        return exchange.limit('deribit', 'Sell', symbol, qty, price);
                    } else {

                        csv.open(process.cwd() + '/db/positions.csv');
                        csv.write([
                            'Deribit',
                            parseInt(new Date().getTime()/1000),
                            'Sell',
                            'Market',
                            qty,
                            symbol
                        ]);

                        return exchange.market('deribit', 'Sell', symbol, qty);
                    }
                },
                editOrder: function (order_id="0000-0000-0000-0000", amount=0, price=0, post_only="", reduce_only="", advanced="", stop_price="") {
                    return exchange.editOrder ('deribit', order_id, amount, price, post_only, reduce_only, advanced, stop_price);
                },
                orders: function (symbol='BTC', kind="future", type='all') {
                    return exchange.openOrders ('deribit', symbol, kind, type);
                },
                cancelAll: function () {
                    return exchange.cancelAll ('deribit');
                },
                getDepositAddress: function (symbol='BTC') {
                    return exchange.getDepositAddress ('deribit', symbol);
                },
                getHistoricalVolatility: function (symbol='BTC') {
                    return exchange.getHistoricalVolatility ('deribit', symbol);
                },
            },
            bittrex: {
                price: function (c='btc') {
                    return local.get(`exchange/real/price/${c}/bittrex`);
                },
                positions: () => {
                    return local.get('positions/bittrex');
                },
                volume: () => {
                    return global.data.size.bittrex;
                },
                buy: function (price=false, qty=process.env.CAPITAL, symbol='BTC-PERPETUAL') {},
                sell: function (price=false, qty=process.env.CAPITAL, symbol='BTC-PERPETUAL') {},
                editOrder: function () { return false; },
                orders: function () { return false; },
                cancelAll: function () { return false; },
                getDepositAddress: function () { return false; },
                getHistoricalVolatility: function () { return false; },
            },
            bitmex: {
                price: function (c='btc') {
                    return local.get(`exchange/real/price/${c}/bitmex`);
                },
                positions: () => {
                    return local.get('positions/bitmex');
                },
                volume: () => {
                    return global.data.size.bitmex;
                },
                buy: function (price=false, qty=process.env.CAPITAL, symbol='BTC-PERPETUAL') {},
                sell: function (price=false, qty=process.env.CAPITAL, symbol='BTC-PERPETUAL') {},
                editOrder: function () { return false; },
                orders: function () { return false; },
                cancelAll: function () { return false; },
                getDepositAddress: function () { return false; },
                getHistoricalVolatility: function () { return false; },
            },

            telegram: telegram,
            indicators: indicators,
            csv: csv,
            request: request,
            readExt: function (file="") {
                return fs.readFileSync(`${process.cwd()}/extensions/${file}`, 'utf8');
            },

            UI: {
                text: "",
                error: "",
                console: [],
                customChart: [],
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
            },

            env: (e) => {
                return (e in process.env ? process.env[e] : false);
            },
            len: (e) => {
                return (e ? e : []).length;
            },
            average: function (e) {
                var _ = 0;
                for (let i = 0; i < e.length; i++) {
                    _ = _ + e[i];
                }
                return _ / e.length;
            },
            havePosition: (positions=[], side='Sell') => {
                if (positions != []) {
                    for (const P of positions) {
                        if ('side' in P && P.side == side) {
                            return P;
                        }
                    }
                }

                return false;
            },
            time: function () { return parseInt(new Date().getTime()/1000) },
            cwd: function () { return process.cwd(); },
            listToChart: function (list=[]) {

                var line = [];
                var lastTime = 0;

                for (const point in list) {
                    lastTime = lastTime + 1;
                    line.push({
                        time: parseInt(new Date().getTime()/1000) - lastTime,
                        value: list[point]
                    })
                }

                return line.reverse();

            },
            on: function (action="default", callback=null) {
                if (action && callback) {
                    return actions.register (action, callback);
                }

                return false;
            }

        }

    }


    /**
     * Function to get the script library
     *
     * @returns {any}
     */

    lib () {
        return {
            boot: new this.vm.Script (this.fs.readFileSync(__dirname + "/../scripts/boot.js")),
            init: new this.vm.Script (this.fs.readFileSync(__dirname + "/../scripts/init.js")),
            everyPrice: new this.vm.Script (this.fs.readFileSync(__dirname + "/../scripts/everyPrice.js")),
            everyPriceScalping: new this.vm.Script (this.fs.readFileSync(__dirname + "/../scripts/everyPriceScalping.js")),
            everyPriceWait: new this.vm.Script (this.fs.readFileSync(__dirname + "/../scripts/everyPriceWait.js")),
            everySecond: new this.vm.Script (this.fs.readFileSync(__dirname + "/../scripts/everySecond.js")),
            sometimes: new this.vm.Script (this.fs.readFileSync(__dirname + "/../scripts/sometimes.js")),
            user: new this.vm.Script (this.fs.readFileSync(this.source))
        }
    }


    /**
     * Get the current context
     *
     * @returns {{}}
     */

    currentContext () {
        return global.virtual_context;
    }

}

module.exports = VM;