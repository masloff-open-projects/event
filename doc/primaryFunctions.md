# Primary firmware functions

<img src='https://svgshare.com/i/NXN.svg' width="100%">

At startup, the terminal connects to the exchanges and starts listening to them. Exchanges send to it the current price for currencies, order book, information on liquidation, etc. The terminal processes all this information and stores something in its RAM, something in the hard disk memory. 

Then the obtained information is processed in corresponding functions, one of which is the firmware. 

__Firmware__ is a user code that is executed by the terminal to perform trading operations.

There is an environment for your firmware, which you use when writing code for the terminal! It is simple!

### What does the program consist of

The firmware sucks from the functions that the terminal calls during certain actions. Below you will see a table of available functions.

#### List of available firmware events

| Function      | Params | When call    |
| ------------- | ------------- | ------------- |
| init    | Don`t have params | Called at the start of the terminal  |
| everyPrice    | Don`t have params | Called up every time the price is updated  |
| everyPriceWait    | Don`t have params | Called up at each price update, but ignores subsequent requests for some time  |
| [everyPriceScalping](scalping.md)    | `Delta`, `Local trand`, `The average delta for the period` and `Average delta trand` and  | It is called every time the price changes and passes the data to the function for analysis. |

In addition to the functions, you also have access to the environment methods, which you can call yourself

### Next

1. [VM functions](vm.md)
2. [Scalping](scalping.md)