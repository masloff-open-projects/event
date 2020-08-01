function tick_price () {
  
  UI.clearConsole();  
  UI.log(f.pos)

  UI.text = 3;

//  system.exchange.deribit.balance(system.keypair.deribit).then(function(e) {
//    UI.send(e.result)
//  })
  
  if (delta.delta > 0) {
  	
    UI.log('Delta > 0');
    
    if ($.len(positions.bybit) > 0) {
      
      if (positions.bybit[0].side == 'Buy') {
		bybit.sell();
      } else {
      	bybit.buy();
      }
     
    }
    
  } else {
    UI.log('Delta < 0');
    UI.chart.marker('Delta < 0');
    
    if ($.len(positions.bybit) > 0) {
      
      if (positions.bybit[0].side == 'Buy') {
		bybit.sell();
      } else {
      	bybit.buy();
      }
     
    }
    
  }
  
}