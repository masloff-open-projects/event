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