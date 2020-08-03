function everyPrice () {

}

function everyPriceWait() {
	
  if (indicators().bybit.deribit.precent.A > 0.1) {
    if (!havePosition(deribit.positions(), 'Buy')) {
      telegram.send('Открываю лонг на дерибит')
      deribit.buy(false, 100);
    }
    
    var position = havePosition(deribit.positions(), 'Sell');
    if (position) {
      telegram.send(`Закрываю шорт на ${position.size} на дерибит. ${position.pnl}`)
      deribit.buy(false, position.size);
    }
    
    
  } else if (indicators().bybit.deribit.precent.A < -0.11){
  	if (!havePosition(deribit.positions(), 'Sell')) {
      telegram.send('Открываю шорт на дерибит')
      deribit.sell(false, 100);
    }
    
    var position = havePosition(deribit.positions(), 'Buy');
    if (position) {
      telegram.send(`Закрываю лонг на ${position.size} на дерибит. ${position.pnl}`)
      deribit.sell(false, position.size);
    }
    
  }
  
  
  
  // havePosition(bybit.positions(), 'Sell')
}

function init () {
	UI.set ('Init success..'); 
}

