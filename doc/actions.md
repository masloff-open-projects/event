# Hot Actions

To perform some trading operations you may need to intercept stock exchange events faster than using the primary VM functions. For this you can use the `on` function. 

Let's create a small example of how to use this function 

``` javascript
function init () {
  on ('exchangeUpdatePositions', function (e) {
    UI.log(e);
  });
}
```

In this example, I have registered an event handler to update positions on the exchange. When the price is updated, the terminal console will display a message about the exchange on which the positions were updated and the list of positions. Below is an example of an object that is passed to the function.

``` javascript
{
    exchange: 'bybit',
    positions: []
}
```

All the positions were closed and I got an empty list in `positions`. 