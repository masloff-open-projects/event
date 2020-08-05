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

##### What does this algorithm do?

`everyPriceWait` is a primary function. It is called every time the price of the exchange is updated, but ignores the price update for the next 2 seconds.  That is, when the price on any exchange changes in any direction, the terminal calls the function `everyPriceWait`, but if the price changes again before 2 seconds, the function ignores this change. What is it for? If the exchange price is updated very frequently, your requests to close or open positions may not work correctly. You can increase the time to ignore requests by calling the `changeEveryPriceWaitTime(ms)` function. The source code of the `everyPriceWait` function can be found at `````/scripts/everyPriceWait.js`````.

Variable `Delta` denotes the delta of price change, at which the program will open and close trading positions. 

I used class `indicators` to get indicator data. From this class, I called the method `delta()`, which returned me an object with delta all exchanges. To get a relative delta between ByBit and Deribit, I used the keys `bybit` and `deribit` in the body of the answer `indicators.delta()`. The answer of `indicators.delta().bybit.deribit` has several possible values. I am interested in the percentage between the prices of these exchanges. I use the key `percent` to get all possible percentage values. Key `A` specifies that I want to get a percentage between exchanges with type A. As a result, I get this code `indicators.delta().bybit.deribit.percent.A`.

When the percentage delta between ByBit and Deribit is greater than 0.115, the code will check whether the exchange has an open short - `havePosition(deribit.positions(), 'Buy')`. The first parameter I call the exchange volume `deribit`, it contains the function `positions()` - it returns all open positions in the exchange. Function `havePosition` takes the list of positions at the exchange from function `deribit.positions()` as the first argument, the second argument function takes the type of position - buy or sell. Note that you should always write only `Buy` for buy and `Sell` for sell positions. Parameters `sell`, `seLL`, etc. will be ignored. 

The function `havePosition` returns `False` if the position is not found and returns the object of the position if it is found. 

Example position object:

```json
{
   "exchange": "Deribit",
   "symbol": "BTC-PERPETUAL",
   "side": "Sell",
   "size": -50,
   "leverage": 100,
   "take_profit": false,
   "stop_loss": false,
   "pnl": -0.000001,
   "created_at": false,
   "fee": false,
   "margin": 0.000043833,
   "liq": -5
}
```

The program has checked that there are no Buy positions, this is the reason to open a market Buy order! I used the `deribit.buy(false, 50);` method to buy the bitcoin for $50 at the market price. To open a Buy Limit order, you must use the method `deribit.buy(price, 50);`. Thus you will buy the bitcoin for $50 at the price of `price`.

Further code will be completely clear to you - I have not used any new methods in it.

### Firmware basics immersion
1. [About primary functions](doc/primaryFunctions.md)
2. [VM functions](doc/vm.md)

Authors: 
<div>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>