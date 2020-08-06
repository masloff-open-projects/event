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


<!--- <img src='https://svgshare.com/i/NXQ.svg' title='' wdith="100%"/> -->