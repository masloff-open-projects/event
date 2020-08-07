$(document).ready(function() {

    $('#logic-editor').click(function () { window.open("/code", "", "width=1200,height=800"); });

    $(`[data-action="changeLineShow"]`).change(function(e) {
        let lineId = $(this).attr('data-line');
        localStorage.setItem(`lineShow-${lineId}`, (this.value == "true" || this.value == true) ? true : false);
        window.chart_object.applyOptions({});
    });
    $(`[data-action="changeIndicatorShow"]`).change(function(e) {
        let indicatorId = $(this).attr('data-indicator');
        localStorage.setItem(`indicator-${indicatorId}-exchange`, (this.value == "false" || this.value == false) ? false : this.value);
        window.chart_object.applyOptions({});
    });

    for (const element of $(`[data-action="changeLineShow"]`)) {
        let lineId = $(element).attr('data-line');
        let value = localStorage.getItem(`lineShow-${lineId}`) === null ? "true" : localStorage.getItem(`lineShow-${lineId}`);
        $(element).val(value);
    }

    window.chart_object = LightweightCharts.createChart(exchange_chart, {
        height: $(document).height() * 0.54,
        rightPriceScale: {
            scaleMargins: {
                top: 0.3,
                bottom: 0.25,
            },
            borderVisible: true,
        },
        layout: {
            backgroundColor: '#232323',
            textColor: '#ffffff',
        },
        grid: {
            vertLines: {
                color: '#3e3e3e',
            },
            horzLines: {
                color: '#3e3e3e',
            },
        },
        autosize: true,
        interval: 15,
        timezone: 'America/New_York',
        theme: 'Light',
        style: 1,
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        hide_side_toolbar: false,
        save_image: false,
        hideideas: true,
        studies: [],
    });
    window.chart = {
        bybit: window.chart_object.addAreaSeries({
            topColor: 'rgba(229, 171, 97, 0.56)',
            bottomColor: 'rgba(229, 171, 97, 0.04)',
            lineColor: 'rgba(229, 171, 97, 1)',
            lineWidth: 1,
        }),
        deribit: window.chart_object.addAreaSeries({
            topColor: 'rgba(32, 197, 173, 0.56)',
            bottomColor: 'rgba(32, 197, 173, 0.04)',
            lineColor: 'rgba(32, 197, 173, 1)',
            lineWidth: 1,
        }),
        bittrex: window.chart_object.addAreaSeries({
            topColor: 'rgba(20, 93, 255, 0.56)',
            bottomColor: 'rgba(20, 93, 255, 0.04)',
            lineColor: 'rgba(20, 93, 255, 1)',
            lineWidth: 1,
        }),
        bitmex: window.chart_object.addAreaSeries({
            topColor: 'rgba(241, 79, 76, 0.56)',
            bottomColor: 'rgba(241, 79, 76, 0.04)',
            lineColor: 'rgba(241, 79, 76, 1)',
            lineWidth: 1,
        }),
        custom: window.chart_object.addLineSeries({
            lineColor: 'rgba(255, 255, 255, 1)',
            lineWidth: 1,
        }),
        volume: window.chart_object.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        })
    }

    $.contextMenu({
        selector: '.exchange-position',
        callback: function(key, options) {

            if (key == 'close') {
                let exchange = $(this).attr('data-exchange');
                let size = $(this).attr('data-size');
                let side = $(this).attr('data-side');
                let symbol = $(this).attr('data-symbol');

                wss_stream.send('openMarketPosition', {
                    exchange: exchange.toLocaleLowerCase(),
                    size: Math.abs(size),
                    side: side == 'Buy' ? 'Sell' : 'Buy',
                    symbol: symbol
                });
            }

        },
        items: {
            "close": {name: "Close", icon: "close"},
        }
    });

    $.contextMenu({
        selector: '.user-connection-controller',
        callback: function(key, options) {

            if (key == 'disconnect') {
                wss_stream.send('disconnectIP', {
                    ip: $(this).attr('data-ip')
                });
            }

        },
        items: {
            "disconnect": {name: "Disconnect", icon: "disconnect"},
        }
    });

    let timeout = 3000;
    let lastActiveTimestamp = 0;
    let userIsActive = false;

    window.addEventListener('blur', function() {

        wss_stream.send('changeIpState', {
            ip: 'socket' in document ? document.socket.ip : 'unknown',
            state: 'leave'
        });

    }, false);
    window.addEventListener('focus', function() {

        wss_stream.send('changeIpState', {
            ip: 'socket' in document ? document.socket.ip : 'unknown',
            state: 'online'
        });

    }, false);
    window.addEventListener('mousemove', active);
    window.addEventListener('keypress', active);
    window.addEventListener('click', active);

    setInterval(checkUserIsActive, 1000)
    active();

    function checkUserIsActive() {
        if (userIsActive && new Date().getTime() - lastActiveTimestamp > timeout){
            userIsActive = false;

            wss_stream.send('changeIpState', {
                ip: 'socket' in document ? document.socket.ip : 'unknown',
                state: 'online'
            });

        }
    }

    function active() {
        lastActiveTimestamp = new Date().getTime();
        if (!userIsActive) {
            userIsActive = true;

            wss_stream.send('changeIpState', {
                ip: 'socket' in document ? document.socket.ip : 'unknown',
                state: 'active'
            });

        }
    }

});

$(document).resize(function() {

    if ('chart_object' in window) {

        const chart_height = $(document).height() / 1.5;
        const chart_width = $("#exchange_chart").width();

        window.chart_object.applyOptions({ width: chart_width, height: chart_height })

    }

});

wss_stream.on ('actions', function (e=null) {
    return {
        'whoIsMe': {},
        'balance': {},
        'indicators': [
            {
                name: "delta"
            }
        ],
        'conditions': {},
        'positions': {},
        'ordersBook': {
            symbol: 'btc',
            exchange: 'bitmex'
        },
        'console': {},
        'users': {},
        'connections': {},
        'liquidations': {},
        'priceHistory': {
            symbol: 'btc',
            exchanges: {
                bybit: localStorage.getItem(`lineShow-bybit`) === null ? true : localStorage.getItem(`lineShow-bybit`),
                deribit: localStorage.getItem(`lineShow-deribit`) === null ? true : localStorage.getItem(`lineShow-deribit`),
                bittrex: localStorage.getItem(`lineShow-bittrex`) === null ? true : localStorage.getItem(`lineShow-bittrex`),
                bitmex: localStorage.getItem(`lineShow-bitmex`) === null ? true : localStorage.getItem(`lineShow-bitmex`),
            }
        },
        'volumeHistory': {
            symbol: 'btc',
            exchange: 'bitmex'
        },
    }
});

wss_stream.on ('open', function (e=null) {

    for (const action in wss_stream.call('actions')) {
        let data = wss_stream.call('actions')[action];
        wss_stream.send(action, data);
    }

    setInterval(function (e=null) {
        wss_stream.send('balance', wss_stream.call('actions').balance);
    }, 8000);
})

wss_stream.on ('error', function (e=null) {
    $('#ui-preloader').css('display', '');
})

wss_stream.on ('close', function (e=null) {
    $('#ui-preloader').css('display', '');
})

$(document).ready(function (e) {

    wss_stream.register('whoIsMe', function (e=null) {
        if (typeof e == typeof []) {
            document.socket = e[0];
        }
    });

    wss_stream.register('volumeHistory', function (e=null) {
        if (typeof e == typeof []) {
            let volumes = e[0];
            window.chart.volume.setData(volumes);
        }

        wss_stream.send('volumeHistory', wss_stream.call('actions').volumeHistory);
    });

    wss_stream.register('connections', function (e=null) {
        if (typeof e[0] == typeof []) {
            $("#users-list").text('');
            for (const device of e[0]) {

                var stateColor = "";

                switch (device.state) {

                    case 'ready':
                        stateColor = '#ec9811';
                        break;

                    case 'online':
                        stateColor = '#79b83d';
                        break;

                    case 'leave':
                        stateColor = '#f14f4c';
                        break;

                    case 'active':
                        stateColor = '#297CB3';
                        break;

                }

                $("#users-list").append(`<div class="user user-connection-controller" data-ip="${device.ip}"> <i class="fa fa-circle user-online-indicator" aria-hidden="true" style="color: ${stateColor};"></i> <b>${(('socket' in document ? document.socket.ip : 'unknown') == device.ip ? "Your PC" : device.alias)}</b>: ${device.ip}</div>`);
            }
        }

        wss_stream.send('connections', wss_stream.call('actions').connections);
    });

    wss_stream.register('balance', function (e=null) {
        if (typeof e == typeof []) {
            if (e[0].ret_msg == 'OK') {

                let balance = e[0].result.BTC.available_balance;
                let bybit_tpnl = e[0].result.BTC.cum_realised_pnl;
                let bybit_spnl = e[0].result.BTC.realised_pnl;
                let bybit_tpnl_usd = parseFloat(bybit_tpnl) * ('price' in document ? document.price.btc : 0);
                let bybit_spnl_usd = parseFloat(bybit_spnl) * ('price' in document ? document.price.btc : 0);

                $("#balance_bybit").text(balance ? parseFloat(balance).toFixed(4) : '0');

                $("#spnl_bybit").text(bybit_spnl ? parseFloat(bybit_spnl).toFixed(4) : '0')
                $('#spnl_bybit_usd').text(bybit_spnl_usd ? parseFloat(bybit_spnl_usd).toFixed(2) : '0')

                $("#tpnl_bybit").text(bybit_tpnl ? parseFloat(bybit_tpnl).toFixed(4) : '0')
                $('#tpnl_bybit_usd').text(bybit_tpnl_usd ? parseFloat(bybit_tpnl_usd).toFixed(2) : '0')

                if (bybit_tpnl > 0) { $('#tpnl_bybit').addClass("pnl-up"); } else { $('#tpnl_bybit').addClass("pnl-down"); }
                if (bybit_spnl > 0) { $('#spnl_bybit').addClass("pnl-up"); } else { $('#spnl_bybit').addClass("pnl-down"); }


            }
        }

        if (e[1].result) {

            let balance = e[1].result.balance;
            let deribit_tpnl = e[1].result.total_pl;
            let deribit_spnl = e[1].result.session_rpl;
            let deribit_tpnl_usd = parseFloat(deribit_tpnl) * ('price' in document ? document.price.btc : 0);
            let deribit_spnl_usd = parseFloat(deribit_spnl) * ('price' in document ? document.price.btc : 0);

            $("#balance_deribit").text(balance ? parseFloat(balance).toFixed(4) : '0');

            $("#spnl_deribit").text(deribit_spnl ? parseFloat(deribit_spnl).toFixed(4) : '0')
            $('#spnl_deribit_usd').text(deribit_spnl_usd ? parseFloat(deribit_spnl_usd).toFixed(2) : '0')

            $("#tpnl_deribit").text(deribit_tpnl ? parseFloat(deribit_tpnl).toFixed(4) : '0')
            $('#tpnl_deribit_usd').text(deribit_tpnl_usd ? parseFloat(deribit_tpnl_usd).toFixed(2) : '0')

            if (deribit_tpnl > 0) { $('#tpnl_deribit').addClass("pnl-up"); } else { $('#tpnl_deribit').addClass("pnl-down"); }
            if (deribit_spnl > 0) { $('#spnl_deribit').addClass("pnl-up"); } else { $('#spnl_deribit').addClass("pnl-down"); }

        }

    });

    wss_stream.register('console', function (e=null) {
        if (typeof e == typeof []) {

            let error = e[0].UI.error;
            let text = e[0].UI.text;
            let console = e[0].UI.console;
            let chart = e[0].UI.customChart;

            (async function () {
                if (text) {

                    if (text == typeof {}) {

                        $("#user-bridge").text('');

                        for (const e in text) {
                            $("#user-bridge").append(`<b>${e}</b>: ${text[e]}<br>`);
                        }

                    } else {
                        $("#user-bridge").text(text);
                    }
                } else {
                    $("#user-bridge").text("");
                }
            }) ();

            (async function () {
                if (error) {
                    $("div#primary-logic-error").css('display', 'block');
                    $("div#primary-logic-error").text(error);
                } else {
                    $("div#primary-logic-error").css('display', '');
                    $("div#primary-logic-error").text('');
                }
            }) ();

            (async function () {
                if (console) {

                    $("div#console").html("");

                    for (const event of console) {
                        if (event.type == 'error') {
                            $("div#console").append(`<div class="message error"> <span class="time">${event.time}</span> <span class="error-conosle-message">${typeof event.message == typeof {} ? JSON.stringify(event.message) : event.message}</span></div>`);
                        } else {
                            $("div#console").append(`<div class="message"> <span class="time">${event.time}</span> ${typeof event.message == typeof {} ? JSON.stringify(event.message) : event.message}</div>`);
                        }
                    }

                } else {
                    $("div#console").html("");
                }
            }) ();

            (async function () {
                window.chart.custom.setData(chart);
            }) ();

            wss_stream.send('console', wss_stream.call('actions').console);

        }
    });

    wss_stream.register('indicators', function (e=null) {

        if (typeof e == typeof []) {

            let indicators = e[0];
            let exchanges = indicators.delta;

            for (const exchange in exchanges) {
                const exchangeBody = exchanges[exchange];

                for (const exchange_ in exchangeBody) {
                    const exchangeBody_ = exchangeBody[exchange_]

                    if (!$(`#delta-data-${exchange}-${exchange_}-value`).length) {
                        $('#deltas-list-body').append(`<tr> <td id="delta-data-${exchange}-${exchange_}-name">Delta name</td> <td id="delta-data-${exchange}-${exchange_}-value">0</td> </tr>`);
                    }


                    $(`#delta-data-${exchange}-${exchange_}-name`).text(`${exchange}/${exchange_}`);
                    $(`#delta-data-${exchange}-${exchange_}-name`).attr('class', exchangeBody_ > 0 ? 'up' : 'down');
                    $(`#delta-data-${exchange}-${exchange_}-name`).css('width', `${Math.abs(exchangeBody_) > 70 ? 70 : Math.abs(exchangeBody_)}%`);
                    $(`#delta-data-${exchange}-${exchange_}-value`).text(parseFloat(exchangeBody_).toFixed(2));
                    $(`#delta-data-${exchange}-${exchange_}-value`).attr('class', exchangeBody_ > 0 ? 'int-up' : 'int-down');
                
                }

            }

            wss_stream.send('indicators', wss_stream.call('actions').indicators);
        }
    });

    wss_stream.register('positions', function (e=null) {
        if (typeof e == typeof []) {

            let positions = e[0];

            $(`table#positions > tbody`).html('');

            for (const position of positions) {

                $(`table#positions > tbody`).append(`<tr height="48px" valign="center" class="exchange-position" data-exchange="${position.exchange}" data-symbol="${position.symbol}" data-side="${position.side}" data-size="${position.size}">
                        <td><b>${position.exchange}</b></td>
                        <td>${position.symbol ? position.symbol : '0'}</td>
                        <td>${position.side == 'Buy' ? `<span class='marker-buy'> <i class="fa fa-sort-up" aria-hidden="true"></i> Buy</span>` : `<span class='marker-sell'> <i class="fa fa-sort-down" aria-hidden="true"></i> Sell</span>`}</td>
                        <td>${position.size ? (position.size).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') : '0'} USD</td>
                        <td>${position.leverage ? position.leverage : '0'}</td>
                        <td>${position.margin ? parseFloat(position.margin).toFixed(6) : '0'}</td>
                        <td><span class="${position.pnl > 0 ? 'pnl-up' : 'pnl-down'}">${position.pnl ? parseFloat(position.pnl).toFixed(6) : '0'}</span> BTC</td>
                        <td>${position.fee ? position.fee : '0'}</td>
                        <td>${position.liq ? position.liq : '0'}</td>
                    </tr>`);

            }

            wss_stream.send('positions', wss_stream.call('actions').positions);
        }
    });

    wss_stream.register('liquidations', function (e=null) {
        if (typeof e == typeof []) {

            if (e[0]) {
                // console.log(e[0]);
            }

            wss_stream.send('liquidations', wss_stream.call('actions').liquidations);
        }
    });

    wss_stream.register('ordersBook', function (e=null) {
        if (typeof e == typeof []) {

            let orders = e[0];

            if (orders) {

                // Bids
                for (let i = 0; i < 10; i++) {

                    var delta = (orders.bids[i][1]/800000)*100;
                        delta = delta > 64 ? 64 : delta;
                        delta = delta < 10 ? 10 : delta;

                    $(`#bp${i}`).text(orders.bids[i][0]);
                    $(`#bq${i}`).text(orders.bids[i][1]);
                    $(`#bp${i}`).css('width', `${delta}%`);
                    $(`#bp${i}`).css('background', `rgba(71, 93, 47, ${delta * 0.05})`);

                }


                // Asks
                for (let i = 0; i < 10; i++) {

                    var delta = (orders.asks[i][1]/800000)*100;
                        delta = delta > 64 ? 64 : delta;
                        delta = delta < 10 ? 10 : delta;

                    $(`#sp${i}`).text(orders.asks[i][0]);
                    $(`#sq${i}`).text(orders.asks[i][1]);
                    $(`#sp${i}`).css('width', `${delta}%`);
                    $(`#sp${i}`).css('background', `rgba(117, 52, 51, ${delta * 0.05})`);

                }
            }

            wss_stream.send('ordersBook', wss_stream.call('actions').ordersBook);

        }
    });

    wss_stream.register('priceHistory', function (e=null) {
        if (typeof e == typeof []) {

            let priceHistory = e[0];

            if ('bybit' in priceHistory) { window.chart.bybit.setData(priceHistory.bybit.history); } else {  window.chart.bybit.setData([]); }
            if ('deribit' in priceHistory) { window.chart.deribit.setData(priceHistory.deribit.history); } else { window.chart.deribit.setData([]); }
            if ('bittrex' in priceHistory) { window.chart.bittrex.setData(priceHistory.bittrex.history); } else { window.chart.bittrex.setData([]); }
            if ('bitmex' in priceHistory) { window.chart.bitmex.setData(priceHistory.bitmex.history); } else { window.chart.bitmex.setData([]); }

            ('price' in document ? null : document.price = {});
            document.price['btc'] = priceHistory[Object.keys(priceHistory)[0]].price;

            $("#exchange_chart_statusbar").text(`Connected!`);


            wss_stream.send('priceHistory', wss_stream.call('actions').priceHistory);

        }
    });

});

