/**
 * Co-availability class for working with indicators.
 * The class will also be reduced to work with technical analysis.
 *
 * @version: 1.0.0
 * @author: Event
 */

class indicators {

    constructor() {
        this.actions = {}
        this.SMA = require('technicalindicators').SMA;
        this.MACD = require('technicalindicators').MACD;
    }


    /**
     * Indicator registration
     *
     * @param action
     * @param data
     * @returns {boolean|*}
     */

    register (action='delta', callback={}) {
        if (!(action in this.actions)) {
            this.actions[action] = callback;
        }
        return false;
    }


    /**
     * Calling the indicator
     *
     * @param action
     * @param data
     * @returns {boolean|*}
     */

    call (action='delta', data={}) {
        if (action in this.actions) {
            return this.actions[action](this, data);
        }
        return false;
    }

}

module.exports = indicators;