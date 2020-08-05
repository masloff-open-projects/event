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

    delta () {

        var indicators = {};

        // Create indicators
        for (const exchange in global.data.price) {

            let time = parseInt(new Date().getTime()/1000);
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