const {RestClient} = require('@pxtrn/bybit-api');
const W3CWebSocket = require('websocket').w3cwebsocket;
const crypto = require('crypto');

/**
 * A class for working with stock exchanges.
 * It is intended for work with the direction "trading".
 * The class interacts with exchangers, sends them commands, but does not monitor their status.
 *
 * @version 1.0.0
 */

class exchange {

    constructor(bybit={}, deribit={}) {

        this.bybit = bybit;
        this.deribit = deribit;

        this.bybit_client = new RestClient(bybit.apiKey, bybit.secret, !bybit.testnet);

    }


    /**
     * Universal function for sending data via WWS
     *
     * @param e
     * @param request
     * @returns {Promise}
     */

    eval (e='exchange', request={}) {

        if (e == 'deribit') {
            return new Promise((resolve, reject) => {

                const keypair = this.deribit;
                const client = new W3CWebSocket(keypair.testnet ? "wss://test.deribit.com/ws/api/v2" : "wss://www.deribit.com/ws/api/v2");

                client.onmessage = function (e) {
                    let answer = JSON.parse(e.data);

                    if ('id' in answer) {
                        if (answer.id == 100) {
                            client.send (JSON.stringify(request));
                        } else if (answer.id == 200) {
                            resolve(answer);
                            client.close();
                        }
                    }
                };

                client.onopen = function () {
                    client.send(JSON.stringify({
                        "jsonrpc" : "2.0",
                        "id" : 100,
                        "method" : "public/auth",
                        "params" : {
                            "grant_type" : "client_credentials",
                            "client_id" : keypair.apiKey,
                            "client_secret" : keypair.secret
                        }
                    }));
                };
            });
        } else if (e == 'bybit') {
            return new Promise((resolve, reject) => {

                /**
                 * This code is not worked
                 * @type {{}}
                 */

                const keypair = this.bybit;
                const client = new W3CWebSocket(keypair.testnet ? "wss://stream-testnet.bybit.com/realtime" : "wss://stream.bybit.com/realtime");
                const time = Math.round(+new Date()/1000);
                const expires = time + 1000;
                const signature = crypto.createHmac('sha256', keypair.secret).update('GET/realtime' + expires).digest('hex');

                client.onmessage = function (e) {
                    let answer = JSON.parse(e.data);

                    console.log(answer)

                    if ('id' in answer) {
                        if (answer.id == 100) {
                            client.send (JSON.stringify(request));
                        } else if (answer.id == 200) {
                            resolve(answer);
                            client.close();
                        }
                    }
                };

                client.onopen = function () {
                    client.send(JSON.stringify({
                        "op": "auth",
                        "args": [
                            keypair.apiKey,
                            expires,
                            signature
                        ]
                    }));
                };
            });
        }

    }


    /**
     * Exchange balance enquiry function
     *
     * @param e
     * @param coin
     * @returns {Promise|Promise<*>}
     */

    balance(e='exchange', coin='BTC') {

        if (e == 'bybit') {
            return (this.bybit_client).getWalletBalance({ coin: coin });
        } else if (e == 'deribit') {
            return new Promise((resolve, reject) => {
                resolve(this.eval('deribit', {
                    "jsonrpc" : "2.0",
                    "id" : 200,
                    "method" : "private/get_account_summary",
                    "params" : {
                        "currency" : "BTC",
                        "extended" : true
                    }
                }));
            });
        }

    }


    /**
     * Function for opening a limit trading deal
     *
     * @param e
     * @param side
     * @param symbol
     * @param qty
     * @param price
     * @param take_profit
     * @param stop_loss
     * @param time_in_force
     * @param reduce_only
     * @param close_on_trigger
     * @returns {Promise|Promise<*>}
     */

    limit (e='exchange', side='Sell', symbol='BTCUSD', qty=0, price=0, take_profit=0, stop_loss=0, time_in_force='GoodTillCancel', reduce_only=false, close_on_trigger=false) {

        if (e == 'bybit') {

            let params = {
                side: side,
                symbol: symbol,
                order_type: "Limit",
                qty: qty,
                price: price,
                time_in_force: time_in_force,
                close_on_trigger: close_on_trigger,
                reduce_only: reduce_only
            };

            if (stop_loss) {params['stop_loss'] = stop_loss;}
            if (take_profit) {params['take_profit'] = take_profit;}

            return (this.bybit_client).placeActiveOrder(params);

        } else if (e == 'deribit') {

            return new Promise((resolve, reject) => {

                resolve(this.eval('deribit', {
                    "jsonrpc" : "2.0",
                    "id" : 200,
                    "method" : `private/${side == 'Sell' ? 'sell' : 'buy'}`,
                    "params" : {
                        "instrument_name" : symbol,
                        "amount" : qty,
                        "type" : "limit",
                        "price": price
                    }
                }));

            });

        }

    }


    /**
     * Function for opening a market trading deal
     *
     * @param e
     * @param side
     * @param symbol
     * @param qty
     * @param take_profit
     * @param stop_loss
     * @param time_in_force
     * @param reduce_only
     * @param close_on_trigger
     * @returns {Promise|Promise<*>}
     */

    market (e='exchange', side='Sell', symbol='BTC-PERPETUAL', qty=0, take_profit=0, stop_loss=0, time_in_force="GoodTillCancel", reduce_only=false, close_on_trigger=false) {

        if (e == 'bybit') {

            let params = {
                side: side,
                symbol: symbol,
                order_type: "Market",
                qty: qty,
                time_in_force: time_in_force,
                close_on_trigger: close_on_trigger,
                reduce_only: reduce_only
            };

            if (stop_loss) {params['stop_loss'] = stop_loss;}
            if (take_profit) {params['take_profit'] = take_profit;}

            return (this.bybit_client).placeActiveOrder(params);

        } else if (e == 'deribit') {

            return new Promise((resolve, reject) => {

                resolve(this.eval(e, {
                    "jsonrpc" : "2.0",
                    "id" : 200,
                    "method" : `private/${side == 'Sell' ? 'sell' : 'buy'}`,
                    "params" : {
                        "instrument_name" : symbol,
                        "amount" : qty,
                        "type" : "market",
                    }
                }));

            });

        }

    }


    /**
     * Function for get positions
     *
     * @param e
     * @param symbol
     * @param kind
     * @returns {Promise|Promise<*>}
     */

    positions (e='exchange', symbol="BTC", kind='future') {

        if (e == 'bybit') {
            return (this.bybit_client).getPositions({symbol: symbol});
        } else if (e == 'deribit') {
            return new Promise((resolve, reject) => {
                resolve(this.eval('deribit', {
                    "jsonrpc" : "2.0",
                    "id" : 200,
                    "method" : "private/get_positions",
                    "params" : {
                        "currency" : "BTC",
                        "kind" : kind
                    }
                }));
            });
        }

    }

}

module.exports = exchange;