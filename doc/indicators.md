# Indicators

In exchange practice, there is such a concept as indicators, they are used by traders to understand when they should open a position, and when it should be closed. An entire class has been created for this purpose in the Event.
In your firmware you can use the `indicators` class to get calculations of any indicator.
Let's consider an example of obtaining information from an existing indicator

``` javascript
var percentDelta = indicators.call('percent', {
    symbol: 'btc',
    e1: 'bybit',
    e2: 'deribit'
});
```

I called the `indicators` class, in it I called the `call` method, in which I passed the indicator name and parameters.

``` javascript
{
    symbol: 'btc',
    e1: 'bybit',
    e2: 'deribit'
}
```

1. `symbol` - currency for which the indicator will be applied
2. `e1` - First Exchange
3. `e2` - Second Exchange

There are different parameters for different indicators. You can read about available indicators below

#### Delta

``` javascript
indicators.call('delta', {
    symbol: 'btc',
    e1: 'bybit',
    e2: 'deribit'
});
```

Delta is price difference indicator between two exchanges

###### Params

| Key | Type | Description |
|-------|-------|-------|
| symbol | text | Currency for which the indicator will be applied |
| e1 | text | First Exchange |
| e2 | text | Second Exchange |

<hr>

#### Percent

``` javascript
indicators.call('percent', {
    symbol: 'btc',
    e1: 'bybit',
    e2: 'deribit'
});
```

Percent is an indicator of the difference in price between two exchanges in percentage terms

###### Params

| Key | Type | Description |
|-------|-------|-------|
| symbol | text | Currency for which the indicator will be applied |
| e1 | text | First Exchange |
| e2 | text | Second Exchange |

<hr>

#### Period Average

``` javascript
var percentDelta = indicators.call('period_average', {
    symbol: 'btc',
    e: 'deribit',
    period: 'all'.
    offset: 0
});
```

Period Average is an indicator that shows the average price for a selected period in seconds.

###### Params

| Key | Type | Description |
|-------|-------|-------|
| symbol | text | Currency for which the indicator will be applied |
| e | text | Exchange |
| period | text or int | Price change period in seconds. If you want use all period, type `all` |
| offset | int | (optional) Offset in measurement |

<img src='https://svgshare.com/i/NXq.svg' title='' width="80%" align="center">
<img src='https://svgshare.com/i/NYi.svg' title='' width="80%" align="center"/>

<hr>

#### SMA

``` javascript
var SMA = indicators.call('SMA', {
    symbol: 'btc',
    e: 'deribit',
    period: 5,
    slice: 'all'
});
```

A simple moving average (SMA) calculates the average of a selected range of prices, usually closing prices, by the number of periods in that range. The SMA is a technical indicator that can aid in determining if an asset price will continue or reverse a bull or bear trend

###### Params

| Key | Type | Description |
|-------|-------|-------|
| symbol | text | Currency for which the indicator will be applied |
| e | text | Exchange |
| period | text | Period |
| slice | text | (optional) The first price offset. the same as that of the Period Average indicator. |


<hr>

#### MACD

``` javascript
var SMA = indicators.call('SMA', {
    symbol: 'btc',
    e: 'deribit',
    period: 5,
    slice: 'all'
});

var MACD = indicators.call('MACD', {
    values            : SMA,
    fastPeriod        : 5,
    slowPeriod        : 8,
    signalPeriod      : 3 ,
    SimpleMAOscillator: false,
    SimpleMASignal    : false
  });

```

MACD, short for moving average convergence/divergence, is a trading indicator used in technical analysis of stock prices, created by Gerald Appel in the late 1970s. It is designed to reveal changes in the strength, direction, momentum, and duration of a trend in a stock's price.

###### Params

| Key | Type | Description |
|-------|-------|-------|
| values | list | List of closing prices |
| fastPeriod | int |  |
| slowPeriod | int |  |
| signalPeriod | int |  |
| SimpleMAOscillator | text |  |
| SimpleMASignal | text |  |



<!--- <img src='https://svgshare.com/i/NXQ.svg' title='' wdith="100%"/> -->