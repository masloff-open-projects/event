### Primary firmware functions

<img src='https://svgshare.com/i/NXN.svg' width="100%">

At startup, the terminal connects to the exchanges and starts listening to them. Exchanges send to it the current price for currencies, order book, information on liquidation, etc. The terminal processes all this information and stores something in its RAM, something in the hard disk memory. 

Then the obtained information is processed in corresponding functions, one of which is the firmware. 

__Firmware__ is a user code that is executed by the terminal to perform trading operations.

There is an environment for your firmware, which you use when writing code for the terminal! It is simple!

### What does the program consist of

The firmware sucks from the functions that the terminal calls during certain actions. Below you will see a table of available functions.

### List of available firmware events

| Function      | Params | When call    |
| ------------- | ------------- | ------------- |
| init    | Don`t have params | Called at the start of the terminal  |
| everyPrice    | Don`t have params | Called up every time the price is updated  |
| everyPriceWait    | Don`t have params | Called up at each price update, but ignores subsequent requests for some time  |

In addition to the functions, you also have access to the environment methods, which you can call yourself

### List of available firmware features

| Function      | Params | What does |
| ------------- | ------------- | ------------- |
| UI.log | text, int or object | Writes data to the terminal console |
| UI.set | text or int | Write static data into the terminal console |
| UI.err | text, int or object | Write an error message to the terminal console |
| UI.clearConsole | Don`t have params | Clears the console of all records |
| telegram.send | text | Sends a telegram message to all terminal users |
| env | key | Get environmental value |
| len | list | Get the length of the list |
| havePosition | `{exchange}.positions()` and `side` | If a position from the list of positions with the corresponding side is found, it will return the position object. If not, it will return False |
| time | Don`t have params | Returns the current time stamp to UNIX |
| indicators | Don`t have params | Directly related to the class of `indicators` |
| {exchange}.price | Don`t have params | Returns the current price from the exchange. |
| {exchange}.positions | Don`t have params | Returns current open positions from the exchange |
| {exchange}.volume | Don`t have params | Returns current trading volumes from the exchange |
| {exchange}.buy | `price:int`, `quantity:int` and `instrument:string`  | Will make a buy |
| {exchange}.sell | `price:int`, `quantity:int` and `instrument:string` | Will make a sell |
