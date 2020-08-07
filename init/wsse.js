/**
 * Initialization of all events and the
 * socket handler of the bridge between client and server
 *
 * @version 1.0.0
 */

module.exports = function (wsse=null, exchange=null, wss_tunnel=null, virtualEnv=null, indicators=null, local=null) {

    wsse.register('balance', function (e=null, io=null) {
        return Promise.all([
            exchange.balance('bybit'),
            exchange.balance('deribit')
        ]);
    });

    wsse.register('connections', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {

                var device = [];

                for (const connection of wss_tunnel.connections()) {
                    device.push({
                        alias: "Anonymous",
                        ip: connection.remoteAddress,
                        state: local.get(`user/${connection.remoteAddress}/state`) ? local.get(`user/${connection.remoteAddress}/state`) : 'ready'
                    });
                }

                resolve(device);
            })
        ]);
    });

    wsse.register('console', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {
                resolve({
                    UI: virtualEnv.currentContext().UI
                });
            })
        ]);
    });

    wsse.register('indicators', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {

                var returnData = {};

                if ('data' in e && e.data) {
                    for (const indicator of e.data) {
                        returnData[indicator.name] = indicators.call(indicator.name, {});
                    }
                }

                resolve(returnData);
            })
        ]);
    });

    wsse.register('positions', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {

                var response = [];

                for (const position of (local.get('positions/deribit') ? local.get('positions/deribit') : [{}])) {response.push(position)}
                for (const position of (local.get('positions/bybit') ? local.get('positions/bybit') : [{}])) {response.push(position)}

                resolve(response);
            })
        ]);
    });

    wsse.register('liquidations', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {
                resolve(local.list('exchange/liquidation/real/', false));
            })
        ]);
    });

    wsse.register('ordersBook', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {
                resolve(local.get(`exchange/book/real/${e.data.symbol}/${e.data.exchange}`))
            })
        ]);
    });

    wsse.register('priceHistory', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {

                if ('data' in e && e.data) {

                    var returnData = {};
                    const historyData = local.list('exchange/history/price/', false);

                    for (const _ in historyData) {

                        const history = historyData[_];
                        const symbol = _.toLowerCase().split('/')[0];
                        const exchange = _.toLowerCase().split('/')[1];

                        if (symbol === e.data.symbol && (exchange in e.data.exchanges && (e.data.exchanges[exchange] !== 'false' && e.data.exchanges[exchange] !== false)) ) {

                            const priceData = local.list(`exchange/real/price/${symbol}/`, false);

                            (exchange in returnData ? null : returnData[exchange] = {history: {}, price: {}});

                            returnData[exchange]['history'] = history;
                            returnData[exchange]['price'] = priceData[exchange];

                        }

                    }

                    resolve(returnData);

                } else {

                    resolve(local.list('exchange/history/price/', false));

                }
            })
        ]);
    });

    wsse.register('volumeHistory', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {
                resolve(local.get(`exchange/history/volume/${e.data.symbol}/${e.data.exchange}`))
            })
        ]);
    });

    wsse.register('openMarketPosition', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {
                let data = e.data;
                resolve(exchange.market(data.exchange, data.side, data.symbol, data.size))
            })
        ]);
    });

    wsse.register('disconnectIP', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {
                resolve(wss_tunnel.disconnect(e.data.ip))
            })
        ]);
    });

    wsse.register('whoIsMe', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {
                resolve({
                    ip: io.remoteAddress
                })
            })
        ]);
    });

    wsse.register('changeIpState', function (e=null, io=null) {
        return Promise.all([
            new Promise((resolve, reject) => {
                resolve(local.set(`user/${e.data.ip}/state`, e.data.state))
            })
        ]);
    });

}