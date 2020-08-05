const SMA = require('technicalindicators').SMA;

/**
 * Co-availability class for working with indicators.
 * The class will also be reduced to work with technical analysis.
 *
 * @version: 1.0.0
 * @author: Event
 */

class indicators {

    constructor() {

    }

    /**
     * Function for calculating deltas of a certain type.
     * It can also be used to calculate all types of deltas.
     *
     * @param exchange_1
     * @param exchange_2
     * @param type
     * @returns {{}}
     */

    calculate (exchange_1=false, exchange_2=false, type=false) {

        if (exchange_1 && exchange_2 && type) {

        } else {

            var indicators = {};

            for (const exchange in global.data.price) {
                let price = global.data.price[exchange].btc;
                !indicators[exchange] ? indicators[exchange] = {} : false;
                for (const exchange_ in global.data.price) {
                    let price_ = global.data.price[exchange_].btc;
                    indicators[exchange][exchange_] = {
                        delta: price - price_,
                        percent: {
                            A: (((price-price_)/price) * 100)
                        }
                    }
                }
            }

            return indicators;

        }

    }


    /**
     * Get a delta between two specific exchanges.
     *
     * @param exchange_1
     * @param exchange_2
     * @returns {{}}
     */

    delta (exchange_1=false, exchange_2=false) {
        if (exchange_1 && exchange_2) {
            return this.calculate(exchange_1, exchange_2, 'delta')
        } else {
            return this.calculate();
        }
    }



    SMA (exchange='deribit', period=1, symbol='btc', graph=false) {

        var prices = [];

        for (const priceRecord of global.big_data.priceHistory['bittrex']['btc'].reverse()) {
            prices.push(priceRecord.value)
            if (prices.length > 7000) { break; }
        }

        return SMA.calculate({period : period, values : prices});
    }

}

module.exports = indicators;