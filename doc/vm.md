# VM Functions and methods

To enjoy a virtual environment with comfort, you need to know what environmental features are available to you.

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
| [indicators](indicators.md) | Don`t have params | Directly related to the class of `indicators` |
| {exchange}.price | Don`t have params | Returns the current price from the exchange. |
| {exchange}.positions | Don`t have params | Returns current open positions from the exchange |
| {exchange}.volume | Don`t have params | Returns current trading volumes from the exchange |
| {exchange}.buy | `price:int`, `quantity:int` and `instrument:string`  | Will make a buy |
| {exchange}.sell | `price:int`, `quantity:int` and `instrument:string` | Will make a sell |

Further you can study the [compatibility of methods](compatibility.md) with the stock exchanges and study the class of [indicators](indicators.md)