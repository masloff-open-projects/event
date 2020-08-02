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

    liquidation (e=null) {

    }

    price (e=null) {
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

        for (const exchange in global.data.price) {

            let price = global.data.price[exchange].btc;

            !global.data.indicators[exchange] ? global.data.indicators[exchange] = {} : false;

            for (const exchange_ in global.data.price) {

                let price_ = global.data.price[exchange_].btc;

                global.data.indicators[exchange][exchange_] = {
                    delta: price - price_,
                    procent: {
                        A: (((price-price_)/price) * 100)
                    }
                }
            }

        }
    }

    context () {

        var backup = global.vm_context;

        try {

            return assign(global.vm_context, {
                bybit:{
                    price: global.data.price.bybit,
                    positions: global.data.positions.bybit,
                    volume: global.data.size.bybit,
                },
                deribit: {
                    price: global.data.price.deribit,
                    positions: global.data.positions.deribit,
                    volume: global.data.size.deribit,
                },
                bittrex: {
                    price:  global.data.price.bittrex,
                    volume: global.data.size.bittrex,
                },
                bitmex: {
                    price:  global.data.price.bitmex,
                    volume: global.data.size.bitmex,
                    book: global.data.book.bitmex
                },
                indicators: global.data.indicators,
                time: parseInt(new Date().getTime()/1000),
                data: global.data
            });


        } catch (e) {
            return backup;
        }
    }

}

module.exports = events;