var Average = [];
var AverageSize = 12;
var Capital = 100;

function everyPriceScalping (delta=null, side=null, avg=0, AverageSide=null) {

  UI.set('Programm is working!');

  Average.push(side == 'Up');

  if (len(Average) > AverageSize) {Average.shift()} 
  
  UI.log(average(Average))
  
  if (Average > 0.87) {
    
    deribit.positions().then(function (e) {

        UI.log(e)

    });

    //deribit.buy(false, Capital);

    if (side == "Down") {
     // deribit.sell(false, Capital);
      //telegram.send('Down! Open short');
    }

    if (side == "Up") {
      //deribit.buy(false, Capital);
      //telegram.send('Up! Open long');
    }

  }

}



function init () {

  _.update ('everyPriceScalping_exchangeObject', deribit);
  _.update ('everyPriceScalping_symbol', 'btc')
	
  on ('exchangeUpdatePositions', function (e) {
    if (e.exchange == 'bybit') {
      UI.log(e)
    }
  });
  
}