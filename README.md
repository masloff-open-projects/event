<img src="https://svgshare.com/i/NWh.svg" alt="Event-banner" border="0" width="100%">

# Welcome to the Event!
A terminal that supports any automated trading methods. 

You are on the main page of the trading terminal Event! Let me tell you a little about it. The Event terminal is written on Node.js, it has a web interface for quick navigation through the terminal settings and data. The terminal supports methods of technical analysis, indicators of exchange delta prices. Ah yes, the terminal supports the work with several exchanges. You can connect to the terminal multiple exchangers, the list of available exchangers you will see below. 

### List of available exchanges
| Exchange      | Monitoring    | Trading |
| ------------- | ------------- | ------ |
| ByBit         | Yes  | Yes |
| Deribit       | Yes  | Yes |
| Bittrex       | Yes  | No  |
| BitMex        | Yes  | No  |

Each exchange has two states: __monitoring__ and __trading__.

__Monitoring__ receives messages about price, volumes, order book, liquidations, open positions.

__Trading__ can open limit and market orders to buy and sell.

### How do you work with firmware

Every algorithm that you are going to create for trading is written by you in JavaScript. Let's write a small script and parse its structure.

```javascript
function everyPriceWait () {

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
```
What does this algorithm do?

__everyPriceWait__ is a primary function. It is called every time the price of the exchange is updated, but ignores the price update for the next 2 seconds.  That is, when the price on any exchange changes in any direction, the terminal calls the function __everyPriceWait__, but if the price changes again before 2 seconds, the function ignores this change. What is it for? If the exchange price is updated very frequently, your requests to close or open positions may not work correctly. You can increase the time to ignore requests by calling the __changeEveryPriceWaitTime(ms)__ function. The source code of the __everyPriceWait__ function can be found at `````/scripts/everyPriceWait.js`````.

Variable __Delta__ denotes the delta of price change, at which the program will open and close trading positions. 

I used class __indicators__ to get indicator data. From this class, I called the method __delta()__, which returned me an object with delta all exchanges. To get a relative delta between ByBit and Deribit, I used the keys __bybit__ and __deribit__ in the body of the answer __indicators.delta()__. The answer of __indicators.delta().bybit.deribit__ has several possible values. I am interested in the percentage between the prices of these exchanges. I use the key __percent__ to get all possible percentage values. Key __A__ specifies that I want to get a percentage between exchanges with type A. As a result, I get this code __indicators.delta().bybit.deribit.percent.A__.

When the percentage delta between ByBit and Deribit is greater than 0.115, the code will check whether the exchange has an open short - __havePosition(deribit.positions(), 'Buy')__. The first parameter I call the exchange volume __deribit__, it contains the function __positions()__ - it returns all open positions in the exchange. Function __havePosition__ takes the list of positions at the exchange from function __deribit.positions()__ as the first argument, the second argument function takes the type of position - buy or sell. Note that you should always write only `Buy` for buy and `Sell` for sell positions. Parameters `sell`, `seLL`, etc. will be ignored. 


Authors: 
<div>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>