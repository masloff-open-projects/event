# Scalping

Terminal `Event` gives you the opportunity to create an automatic strategy `Scalping`. 

But if you want to create a really high-speed scalping strategy, you have to use code blanks. 

Let's analyze one simple example of high-speed scalping on the example of the Deribit exchange.

``` javascript

function init () {
    _.update ('everyPriceScalping_exchangeObject', deribit);
    _.update ('everyPriceScalping_symbol', 'btc')
}

function everyPriceScalping () {

}

```