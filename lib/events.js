const vm = require('vm');
const fs = require ('fs');
const assign = require('assign-deep');
const level = require('level')
const db = level('db/price-history')

/**
 * Class for work on actions
 * VM here
 *
 * @version: 1.0.0
 * @package: Event
 */


class events {

    constructor(local) {
        this.local = local;
        try {

            let function_init = global.vm_scripts.init;

            global.vm_context = this.context();
            vm.createContext(global.vm_context);
            vm.runInNewContext(fs.readFileSync(__dirname + "/../scripts/user.js"), global.vm_context);
            vm.runInContext(function_init, global.vm_context);

        } catch (e) {

            global.vm_context.UI.error = e.message;

        }

        fs.watchFile(__dirname + "/../scripts/user.js", (curr, prev) => {

            try{

                global.vm_context = this.context();
                vm.createContext(global.vm_context);
                vm.runInNewContext(fs.readFileSync(__dirname + "/../scripts/user.js"), global.vm_context);

            } catch (e) {

                global.vm_context.UI.error = e.message;

            }

        });

    }


    /**
     * Execute on every liquidation
     *
     * @param e - exchange
     * @param d - data
     * @param c - symbol
     */

    liquidation (e=null, d=null, c='BTC') {

    }


    /**
     * Execute on every update price
     *
     * @param e - exchange
     * @param p - price
     * @param c - symbol
     */

    price (e=null, p=null, c='BTC') {

        // Create ENV
        var local = this.local;

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

        // Set realprice
        global.data.price[e][c == 'BTC' ? 'btc' : 'unknown'] = p;


    }


    /**
     * Execute on every update volumes
     *
     * @param e - exchange
     * @param d - data
     * @param c - symbol
     */

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


    /**
     * Execute on every update order book
     *
     * @param e - exchange
     * @param d - data
     * @param c - symbol
     */

    book (e=null, d=null, c='BTC') {

        // Create ENV
        var local = this.local;

        // Setup books
        local.set(`book/${e}/${c}`, d)
    }


    /**
     * Get context for VM
     *
     * @returns {}
     */

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