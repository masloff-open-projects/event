/**
 * Code extension.
 * Method for creating scalping
 * */

if (typeof everyPriceScalping === "function" && _.get('everyPriceScalping_exchangeObject') && _.get('everyPriceScalping_symbol')) {

    function changeEveryPriceScalpingLastPrice () {
        _.update('everyPriceScalping_lastPrice', _.get('everyPriceScalping_exchangeObject').price(_.get('everyPriceScalping_symbol')));
    }

    function getEveryPriceScalpingLastPrice () {
        return _.get('everyPriceScalping_lastPrice');
    }

    function getEveryPriceScalpingPeriodAverage () {
        return _.get('everyPriceScalping_PeriodAverage');
    }

    try {

        var delta = _.get('everyPriceScalping_exchangeObject').price(_.get('everyPriceScalping_symbol')) - getEveryPriceScalpingLastPrice();

        if (delta != null && delta != 0 && delta !=  _.get('everyPriceScalping_exchangeObject').price(_.get('everyPriceScalping_symbol')) && delta != getEveryPriceScalpingLastPrice()) {
            everyPriceScalping(delta, delta > 0 ? 'Up' : 'Down', _.get('everyPriceScalping_PeriodAverage_value'), _.get('everyPriceScalping_PeriodAverage_value') ? (_.get('everyPriceScalping_PeriodAverage_value') > 0 ? 'Up': 'Down') : 'Unknown')

            var PeriodAverage = getEveryPriceScalpingPeriodAverage() == false ? [] : getEveryPriceScalpingPeriodAverage();
            PeriodAverage.push(delta);
            if (len(PeriodAverage) > _.get('everyPriceScalping_period') == false ? 30 : parseInt(_.get('everyPriceScalping_period'))) { PeriodAverage.shift(); }
            _.update('everyPriceScalping_PeriodAverage', PeriodAverage);

            var sum = 0;
            for(i = 0; i < PeriodAverage.length; i++){ sum += PeriodAverage[i]; }

            _.update('everyPriceScalping_PeriodAverage_value', sum/len(PeriodAverage));

        }


        changeEveryPriceScalpingLastPrice();

    } catch (e) {
        UI.err(`everyPriceScalping: ${e.name}: ${e.message}`)
    }

}