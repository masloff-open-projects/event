/**
 * Code extension.
 * Method for creating scalping
 * */

if (typeof everyPriceScalping === "function" && _.get('everyPriceScalping_exchangeObject') && _.get('everyPriceScalping_symbol')) {

    function changeEveryPriceScalpingLastPrice () {
        _.update('everyPriceScalping_lastPrice', _.get('everyPriceScalping_exchangeObject').price()[_.get('everyPriceScalping_symbol')]);
    }

    function getEveryPriceScalpingLastPrice () {
        return _.get('everyPriceScalping_lastPrice');
    }

    function getEveryPriceScalpingSMA () {
        return _.get('everyPriceScalping_SMA');
    }

    try {

        var delta = _.get('everyPriceScalping_exchangeObject').price()[_.get('everyPriceScalping_symbol')] - getEveryPriceScalpingLastPrice();

        if (delta != 0 && delta !=  _.get('everyPriceScalping_exchangeObject').price()[_.get('everyPriceScalping_symbol')] && delta != getEveryPriceScalpingLastPrice()) {
            everyPriceScalping(delta, delta > 0 ? 'Up' : 'Down', _.get('everyPriceScalping_SMA_value'), _.get('everyPriceScalping_SMA_value') ? (_.get('everyPriceScalping_SMA_value') > 0 ? 'Up': 'Down') : 'Unknown')

            var sma = _.get('everyPriceScalping_SMA') == false ? [] : _.get('everyPriceScalping_SMA');
            sma.push(delta);
            if (len(sma) > _.get('everyPriceScalping_period') == false ? 30 : parseInt(_.get('everyPriceScalping_period'))) { sma.shift(); }
            _.update('everyPriceScalping_SMA', sma);

            var sum = 0;
            for(i = 0; i < sma.length; i++){ sum += sma[i]; }

            _.update('everyPriceScalping_SMA_value', sum/len(sma));

        }


        changeEveryPriceScalpingLastPrice();

    } catch (e) {
        UI.err(`everyPriceScalping: ${e.name}: ${e.message}`)
    }

}