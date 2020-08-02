/**
 * Обработчик событий stream_wss.
 * Этот обработчик связан напряму с VM, он же Virtual.
 * В Virtual выполняется весь пользовательский код
 */

const vm = require('vm');
const fs = require ('fs');
const assign = require('assign-deep');

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
    }

    context () {

        var backup = global.vm_context;

        try {

            return assign(global.vm_context, {
                bybit:{
                    price: global.data.price.bybit,
                    positions: global.data.positions.bybit,
                },
                deribit: {
                    price: global.data.price.deribit,
                    positions: global.data.positions.deribit
                },

                delta: {
                    delta: global.data.price.bybit.btc - global.data.price.deribit.btc,
                    abs: Math.abs(global.data.price.bybit.btc - global.data.price.deribit.btc),
                    average: (global.data.price.bybit.btc + global.data.price.deribit.btc) / 2,
                    procent: {
                        a: (((global.data.price.deribit.btc-global.data.price.bybit.btc)/global.data.price.bybit.btc) * 100) / -1
                    }
                },
                time: parseInt(new Date().getTime()/1000),
                data: global.data
            });


        } catch (e) {
            return backup;
        }
    }

}

module.exports = events;