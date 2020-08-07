/**
 * Initialization of all indicators
 *
 * @version 1.0.0
 */

module.exports = function (indicators=null, local=null, exchange=null) {

    indicators.register('delta', function (instance=null, e=null) {

        if ((typeof e == typeof {}) && ('symbol' in e && 'e1' in e && 'e2' in e)) {

            const price1 = local.get(`exchange/real/price/${e.symbol}/${e.e1}`);
            const price2 = local.get(`exchange/real/price/${e.symbol}/${e.e2}`);

            return parseFloat(price1) - parseFloat(price2)

        } else {

            var returnData = {};
            const priceData = local.list('exchange/real/price/', false);

            for (const _ in priceData) {

                const price = priceData[_];
                const symbol = _.toLowerCase().split('/')[0];
                const exchange = _.toLowerCase().split('/')[1];

                for (const __ in priceData) {

                    const price__ = priceData[__];
                    const symbol__ = __.toLowerCase().split('/')[0];
                    const exchange__ = __.toLowerCase().split('/')[1];

                    if (exchange != exchange__) {

                        (exchange in returnData ? null : returnData[exchange] = {});
                        returnData[exchange][exchange__] = price - price__;

                    }

                }

            }

            return returnData;

        }

    });

    indicators.register('percent', function (instance=null, e=null) {

        if ((typeof e == typeof {}) && ('symbol' in e && 'e1' in e && 'e2' in e)) {

            const price1 = local.get(`exchange/real/price/${e.symbol}/${e.e1}`);
            const price2 = local.get(`exchange/real/price/${e.symbol}/${e.e2}`);

            return (parseInt(price1) - parseInt(price2)/parseInt(price1)) * 100;

        } else {

            var returnData = {};
            const priceData = local.list('exchange/real/price/', false);

            for (const _ in priceData) {

                const price = priceData[_];
                const symbol = _.toLowerCase().split('/')[0];
                const exchange = _.toLowerCase().split('/')[1];

                for (const __ in priceData) {

                    const price__ = priceData[__];
                    const symbol__ = __.toLowerCase().split('/')[0];
                    const exchange__ = __.toLowerCase().split('/')[1];

                    if (exchange != exchange__) {

                        (exchange in returnData ? null : returnData[exchange] = {});
                        returnData[exchange][exchange__] = (parseInt(price) - parseInt(price__)/parseInt(price)) * 100;

                    }

                }

            }

            return returnData;

        }

    });

    indicators.register('period_average', function (instance=null, e=null) {


        if ((typeof e == typeof {}) && ('symbol' in e && 'e' in e && 'period' in e)) {

            const history = local.get(`exchange/clearHistory/price/${e.symbol}/${e.e}`);

            if (typeof history == typeof []) {
                const period = history.reverse().slice(('offset' in e ? e.offset : 0), e.period == 'all' ? history.length : e.period);
                var SumAll = 0;
                for(i = 0; i < period.length; i++){ SumAll += period[i]; }
                return (SumAll/period.length)
            }

            throw 'Not all the parameters are correct';

        } else {
            throw 'Function waits for parameters';
        }

    });

    indicators.register('SMA', function (instance=null, e=null) {

        if ((typeof e == typeof {}) && ('symbol' in e && 'e' in e && 'period' in e && 'slice' in e)) {

            const history = local.get(`exchange/clearHistory/price/${e.symbol}/${e.e}`);
            const values = history.reverse().slice(('offset' in e ? e.offset : 0), e.slice == 'all' ? history.length : e.slice);

            return instance.SMA.calculate({period: e.period, values: values.reverse()});

            throw 'Not all the parameters are correct';

        } else {
            throw 'Function waits for parameters';
        }

    });

    indicators.register('MACD', function (instance=null, e=null) {


        if ((typeof e == typeof {}) && ('values' in e && 'fastPeriod' in e && 'slowPeriod' in e && 'signalPeriod' in e && 'SimpleMAOscillator' in e && 'SimpleMASignal' in e)) {

            return instance.MACD.calculate({
                values: e.values,
                fastPeriod: e.fastPeriod,
                slowPeriod: e.slowPeriod,
                signalPeriod: e.signalPeriod ,
                SimpleMAOscillator: e.SimpleMAOscillator,
                SimpleMASignal: e.SimpleMASignal
            });

            throw 'Not all the parameters are correct';

        } else {
            throw 'Function waits for parameters';
        }

    });

}