### Indicators

In exchange practice, there is such a concept as indicators, they are used by traders to understand when they should open a position, and when it should be closed. An entire class has been created for this purpose in the Event. Let's take a look at its structure and examine it in more detail.
```javascript
class indicators {
    calculate () {
        return {
            "bybit": {
                "deribit": {
                    delta: 0,
                    percent: {
                        A: 0
                    }
                }       
            }               
        };
    }

    delta (exchange_1, exchange_2) {
        return this.calculate(exchange_1, exchange_2, "delta")
    }
}


```
<img src='https://svgshare.com/i/NXQ.svg' title='' wdith="100%"/>