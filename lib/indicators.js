/**
 * An indepAn independent class for working with indicators. Also takes on the task of technical analysis
 * endent class for working with indicators. Also takes on the task of technical analysis
 */

class indicators {

    constructor() {
        this.SMA = require('technicalindicators').SMA;
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

    SMA (period=1, values=[1,2,3,4,5]) {

        var prices = [];

        for (const priceRecord of global.big_data.priceHistory['bittrex']['btc'].reverse()) {
            prices.push(priceRecord.value)
        }

        return sma({period : period, values : prices});
    }

}

module.exports = indicators;