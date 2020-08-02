function everyPrice () {

}

function everyPriceWait() {
	
  var positions_bybit = data.positions.bybit;
  var positions_deribit = data.positions.deribit;
  
  //tlg.send(88)
  
  UI.clearConsole();
  
  UI.log(`Начало тестирования. Капитал тестирования: ${env.CAPITAL}$`);
  UI.log(`Позиций на ByBit: ${$.len(positions_bybit)} / Позиций на Deribit: ${$.len(positions_deribit)}`);
   
  if ($.len(positions_bybit) <= 0) {
    
    bybit.buy(false, 30);
    
  } else {
  
    let position = positions_bybit[0];
    
	UI.log(`На ByBit есть позиция! Кол-во: ${position.size}$`)
   
    if (position.side == 'Buy') {
    	UI.log('На ByBit открыт лонг!')
      	bybit.sell(false, position.size)
    }
    
    if (position.side == 'Sell') {
    	UI.log('На ByBit открыт шорт!')
      	bybit.buy(false, position.size)
    }

  }
  
  
  if ($.len(positions_deribit) <= 0) {
    
    deribit.buy(false, 30);
    
  } else {
  
    let position = positions_deribit[0];
    
	UI.log(`На Deribit есть позиция! Кол-во: ${position.size}$`)
   
    if (position.side == 'Buy') {
    	UI.log('На ByBit открыт лонг!')
      	deribit.sell(false, position.size)
    }
    
    if (position.side == 'Sell') {
    	UI.log('На ByBit открыт шорт!')
      	deribit.buy(false, position.size)
    }

  }
  
}

function init () {
	UI.set ('Init'); 
}

