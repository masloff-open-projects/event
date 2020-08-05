function everyPriceWait() {
  
  var delta = 0.115;

  if (indicators.delta().bybit.deribit.percent.A > delta) {
    if (!havePosition(deribit.positions(), 'Buy')) {
      deribit.buy(false, 50);
    }

    var position = havePosition(deribit.positions(), 'Sell');
    if (position) {
      deribit.buy(false, position.size);
    }


  } else if (indicators.delta().bybit.deribit.percent.A < delta * -1) {
    if (!havePosition(deribit.positions(), 'Sell')) {
      deribit.sell(false, 50);
    }

    var position = havePosition(deribit.positions(), 'Buy');
    if (position) {
      deribit.sell(false, position.size);
    }
  }

}

function everyPriceScalping_ (delta=null, side=null, sma=0, sideSMA) {

  UI.set(`${delta} / ${side} / ${sma} / ${sideSMA}`);

  var capital = 150;

  /**
   * Fix profit
   */

  if (bybit.positions() != []){
    for (const position of bybit.positions()) {
      if (position) {
        if ('pnl' in position) {
          if (position.pnl > Math.abs(0.000018)) {
            if (position.size == 'Sell') {
              bybit.buy (false, position.size);
            } else {
              bybit.sell (false, position.size);
            }
          }
        }
      }
    }
  }

  /**
   * Scalping
   */

  if (sideSMA == 'Up') {
  	
   if (!havePosition(bybit.positions(), 'Buy')) {
      bybit.buy(false, capital);
    }

    var position = havePosition(bybit.positions(), 'Sell');
    if (position) {
      bybit.buy(false, position.size);
    } 
    
  } else if (sideSMA == 'Down') {
	
    if (!havePosition(bybit.positions(), 'Sell')) {
      bybit.sell(false, capital);
    }

    var position = havePosition(bybit.positions(), 'Buy');
    if (position) {
      bybit.sell(false, position.size);
    }
    
  }
  
}

function init () {
  	_.update ('everyPriceScalping_exchangeObject', deribit);
    _.update ('everyPriceScalping_symbol', 'btc')
	
  UI.log(11234);
  //deribit.editOrder('4291635323', 900, 13000, false, false, 'usd', 180000)
  
  // deribit.orders('BTC').then(function (e) {
  //   UI.log (e);
  // });


  // deribit.cancelAll();


  // deribit.getDepositAddress('BTC').then(function (e) {
  //   UI.log(e.result.address);
  // });

  // deribit.getHistoricalVolatility('BTC').then(function (e) {
  //   UI.log(e);
  // });
}

