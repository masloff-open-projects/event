/**
 * Class for work on actions
 *
 * @version: 1.0.0
 * @package: Event
 */


class events {

    constructor(VM, local) {
        this.VM = VM;
        this.local = local;
    }


    /**
     * Execute on every liquidation
     *
     * @param e - exchange
     * @param d - data
     * @param c - symbol
     */

    liquidation (e=null, d=null, c='BTC') {
        this.local.set(`exchange/liquidation/real/${c.toLowerCase()}/${e.toLowerCase()}`, d);
    }


    /**
     * Execute on every update price
     *
     * @param e - exchange
     * @param p - price
     * @param c - symbol
     */

    price (e=null, p=null, c='BTC') {

        if (!(process.env.SAFE == 'false' ? false : true)) {

            this.VM.execute('everyPrice');
            this.VM.execute('everyPriceWait');
            this.VM.execute('everyPriceScalping');

        }

        this.local.set(`exchange/real/price/${c.toLowerCase()}/${e.toLowerCase()}`, p);

    }


    /**
     * Execute on every update volumes
     *
     * @param e - exchange
     * @param d - data
     * @param c - symbol
     */

    volume (e=null, d=null, c='BTC') {
        this.local.set(`exchange/real/volume/${c.toLowerCase()}/${e.toLowerCase()}`, d)
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
        local.set(`exchange/book/real/${c.toLowerCase()}/${e.toLowerCase()}`, d)
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