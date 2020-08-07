function everyPriceWait () {
  
  // var delta = 0.115;
  var SMA = indicators.call('SMA', {
    symbol: 'btc',
    e: 'deribit',
    period: 5,
    slice: 'all'
  });

  UI.customChart = listToChart(SMA);

  var MACD = indicators.call('MACD', {
    values            : SMA,
    fastPeriod        : 5,
    slowPeriod        : 8,
    signalPeriod      : 3 ,
    SimpleMAOscillator: false,
    SimpleMASignal    : false
  });

  // bybit.buy();

  // UI.log(MACD);

  // UI.log(percentDelta);

  // // if (indicators.delta().bybit.deribit.percent.A > delta) {
  // //   if (!havePosition(deribit.positions(), 'Buy')) {
  // //     deribit.buy(false, 50);
  // //   }

  // //   var position = havePosition(deribit.positions(), 'Sell');
  // //   if (position) {
  // //     deribit.buy(false, position.size);
  // //   }


  // // } else if (indicators.delta().bybit.deribit.percent.A < delta * -1) {
  // //   if (!havePosition(deribit.positions(), 'Sell')) {
  // //     deribit.sell(false, 50);
  // //   }

  // //   var position = havePosition(deribit.positions(), 'Buy');
  // //   if (position) {
  // //     deribit.sell(false, position.size);
  // //   }
  // // }
  
}

function everyPriceScalping (delta=null, side=null, sma=0, sideSMA=null) {

  var capital = 150;

  /**
   * Fix profit
   */

  if (deribit.positions() != []){
    for (const position of deribit.positions()) {
      if (position) {
        if ('pnl' in position) {
          if (position.pnl > Math.abs(0.000018)) {
            if (position.size == 'Sell') {
              deribit.buy (false, position.size);
            } else {
              deribit.sell (false, position.size);
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
  	
   if (!havePosition(deribit.positions(), 'Buy')) {
      deribit.buy(false, capital);
    }

    var position = havePosition(deribit.positions(), 'Sell');
    if (position) {
      deribit.buy(false, position.size);
    } 
    
  } else if (sideSMA == 'Down') {
	
    if (!havePosition(deribit.positions(), 'Sell')) {
      deribit.sell(false, capital);
    }

    var position = havePosition(deribit.positions(), 'Buy');
    if (position) {
      deribit.sell(false, position.size);
    }
    
  }  
  
}

function init () {
  	_.update ('everyPriceScalping_exchangeObject', deribit);
    _.update ('everyPriceScalping_symbol', 'btc')
	
  on ('exchangeUpdatePositions', function (e) {
    UI.log(e);
  });

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

  // deribit.buy(13000, 200); 

  //deribit.buy(false, 1000); 
  
  //bybit.buy();

}

 