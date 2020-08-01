/**
 * Обработчик событий stream_wss
 */

const vm = require('vm');
const fs = require ('fs');

class events {

    constructor(vm=false, vm_context={}) {
        this.vm = vm;
        this.context = vm_context;
    }

    price (e=null) {
        if (global.data.price.bybit.btc && global.data.price.deribit.btc) {
            if (!(process.env.SAFE == 'false' ? false : true)) {

                try {

                    global.vm_context = Object.assign(global.vm_context, {
                        price: {
                            bybit: global.data.price.bybit,
                            deribit: global.data.price.deribit,
                        },
                        delta: {
                            delta: global.data.price.bybit.btc - global.data.price.deribit.btc,
                            abs: Math.abs(global.data.price.bybit.btc - global.data.price.deribit.btc),
                            average: (global.data.price.bybit.btc + global.data.price.deribit.btc) / 2,
                            procent: {
                                a: (((global.data.price.deribit.btc-global.data.price.bybit.btc)/global.data.price.bybit.btc) * 100) / -1
                            }
                        },
                        positions: global.data.positions,
                        f: {
                            p: {
                                b: global.data.price.bybit,
                                d: global.data.price.deribit,
                            },
                            pos: global.data.positions,
                            d: {
                                d: global.data.price.bybit.btc - global.data.price.deribit.btc,
                                abs: Math.abs(global.data.price.bybit.btc - global.data.price.deribit.btc),
                                a: (global.data.price.bybit.btc + global.data.price.deribit.btc) / 2,
                                p: {
                                    a: (((global.data.price.deribit.btc-global.data.price.bybit.btc)/global.data.price.bybit.btc) * 100) / -1
                                }
                            }
                        }
                    }, this.context);

                    vm.createContext(global.vm_context);
                    vm.runInNewContext(fs.readFileSync(__dirname + "/../scripts/user.js"), global.vm_context);
                    vm.runInContext('try { tick_price (); } catch (e) { UI.err(e.message); }', global.vm_context);

                    global.vm_context.UI.error = "";

                } catch (e) {
                    global.vm_context.UI.error = e.message;
                }

            }
        }
    }

}

module.exports = events;