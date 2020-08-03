/**
 * Обработчик событий stream_wss.
 * Этот обработчик связан напряму с VM, он же Virtual.
 * В Virtual выполняется весь пользовательский код
 */

const vm = require('vm');
const fs = require ('fs');
const assign = require('assign-deep');
const level = require('level')
const db = level('db/price-history')

class events {

    constructor() {

        try {
            let function_init = global.vm_scripts.init;

            global.vm_context = this.context();
            vm.createContext(global.vm_context);
            vm.runInNewContext(fs.readFileSync(__dirname + "/../scripts/user.js"), global.vm_context);
            vm.runInContext(function_init, global.vm_context);
        } catch (e) {
            global.vm_context.UI.error = e.message
        }

        fs.watchFile(__dirname + "/../scripts/user.js", (curr, prev) => {

            try{
                global.vm_context = this.context();
                vm.createContext(global.vm_context);
                vm.runInNewContext(fs.readFileSync(__dirname + "/../scripts/user.js"), global.vm_context);
            } catch (e) {
                global.vm_context.UI.error = e.message
            }

        });


    }

    liquidation (e=null, d=null, c='BTC') {

    }

    price (e=null, p=null, c='BTC') {

        //Add price record in BD memory
        const time = Math.round(+new Date()/1000);

        if (!(e in global.big_data.priceHistory)) { global.big_data.priceHistory[e] = {}; global.big_data.priceHistory[e].btc = [] }
        if (global.big_data.priceHistory[e][c == 'BTC' ? 'btc' : 'unknown'].length > 8000) { global.big_data.priceHistory[e][c == 'BTC' ? 'btc' : 'unknown'].shift() }

        global.big_data.priceHistory[e][c == 'BTC' ? 'btc' : 'unknown'].push({time: time, value: p})

        if (global.data.price.bybit.btc && global.data.price.deribit.btc) {
            if (!(process.env.SAFE == 'false' ? false : true)) {

                try {

                    if (vm) {

                        let function_everyPrice = global.vm_scripts.everyPrice;
                        let function_everyPriceWait = global.vm_scripts.everyPriceWait;

                        vm.runInContext(function_everyPrice, global.vm_context);
                        vm.runInContext(function_everyPriceWait, global.vm_context);
                    }

                    global.vm_context.UI.error = "";

                } catch (e) {
                    global.vm_context.UI.error = e.message;
                }

            }
        }

        // Set realprice
        global.data.price[e][c == 'BTC' ? 'btc' : 'unknown'] = p;

        // Create indicators
        for (const exchange in global.data.price) {

            let price = global.data.price[exchange].btc;

            !global.data.indicators[exchange] ? global.data.indicators[exchange] = {} : false;

            for (const exchange_ in global.data.price) {

                let price_ = global.data.price[exchange_].btc;

                global.data.indicators[exchange][exchange_] = {
                    delta: price - price_,
                    precent: {
                        A: (((price-price_)/price) * 100)
                    }
                }
            }

        }

        // Save data in history
        global.big_data.priceHistory

    }

    volume (e=null, d=null, c='BTC') {

        //Add volume record in BD memory
        const time = Math.round(+new Date()/1000);

        if (!(e in global.big_data.volumeHistory)) { global.big_data.volumeHistory[e] = {}; global.big_data.volumeHistory[e].btc = [] }
        if (global.big_data.volumeHistory[e][c == 'BTC' ? 'btc' : 'unknown'].length > 8000) { global.big_data.volumeHistory[e][c == 'BTC' ? 'btc' : 'unknown'].shift() }

        global.big_data.volumeHistory[e][c == 'BTC' ? 'btc' : 'unknown'].push({
            time: time,
            value: d.size,
            color: d.side == 'Buy' ? 'rgba(121, 184, 61, 0.3)' : 'rgba(188, 71, 103, 0.3)'
        });

        // Set realvolume
        global.data.size[e][c == 'BTC' ? 'btc' : 'unknown'] = d;


    }

    book (e=null, d=null, c='BTC') {
        global.data.book[e] = d;
    }

    context () {

        var backup = global.vm_context;

        try {

            return global.vm_context;


        } catch (e) {
            return backup;
        }
    }

}

module.exports = events;