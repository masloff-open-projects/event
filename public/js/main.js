(function (e) {

    $(document).ready(function() {

        $('#logic-modal').on('show.bs.modal', function (e) {
            setTimeout(function(){
                if (!('logic_editor' in window)) {

                    $.get("/get/script/user", function(data) {
                        $("#logic_textarea").text(data);

                        window.logic_editor = CodeMirror.fromTextArea(logic_textarea, {
                            lineNumbers: true,
                            styleActiveLine: true,
                            matchBrackets: true,
                            mode: "text/javascript",
                            // keyMap: "sublime",
                            theme: 'darcula',
                            autoCloseTags: true,
                            lineWrapping: true,
                            extraKeys: {
                                "Ctrl-R": function() {
                                    // do something
                                },
                                "Ctrl-S": function() {

                                    $.post("/set/script/user", {
                                        code: window.logic_editor.getValue()
                                    }, function(data) {
                                        alert('Saved!');
                                    });

                                },
                                "Ctrl": "autocomplete"
                            }
                        });
                        window.logic_editor.on("keyup", function (cm, event) {
                            if (event.keyCode != 13 && event.keyCode != 39 && event.keyCode != 37 && event.keyCode != 8 && !cm.state.completionActive) {
                                clearTimeout(window.cm_autocomplite);
                                window.cm_autocomplite = setTimeout(function () {
                                    CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
                                }, 1550);

                            } else if (event.keyCode == 13 || event.keyCode == 8) {
                                clearTimeout(window.cm_autocomplite);
                            }
                        });
                    });

                }
            }, 300);
        });

        $('#logic').click(function () { $('#logic-modal').modal(); });
        $('#logic-editor').click(function () { window.open("/code", "", "width=800,height=600"); });

        window.chart_object = LightweightCharts.createChart(exchange_chart, {
            height: $(document).height() / 1.5,
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

    });

    $(window).resize(function() {

        if ('chart_object' in window) {

            const chart_height = $(document).height() / 1.5;
            const chart_width = $("#exchange_chart").width();

            window.chart_object.applyOptions({ width: chart_width, height: chart_height })

        }

    });

})($);


$(document).ready(function (e) {

    class chart {

        constructor(max=60000) {
            this.chart = {}
            this.settings = {
                max: max
            }
        }

        append (chart="default", data={}) {
            if (!( chart in this.chart )) { this.chart[chart] = []; }
            this.chart[chart].push(data)
            if (this.chart[chart].length > this.settings.max){  this.chart[chart].shift() }
        }

        get (chart="default") {
            if (chart in this.chart) {
                return this.chart[chart];
            } else { return []; }
        }

        set (chart="default", data={}) {
            this.chart[chart] = data;
        }

    }
    class wstream {

        constructor(wss={}) {
            this.actions = {};
            this.wss = wss;
        }

        register (action="default", callback={}) {
            if (!(action in this.actions)) {
                this.actions[action] = callback;
                return true;
            }
            return false;
        }

        ws (action='default', data={}) {
            if (action in this.actions) {
                return this.actions[action](data);
            }
            return false;
        }

        send (action="default", data={}) {
            this.wss.send(JSON.stringify({
                action: action,
                data: data
            }));
        }

    }

    const io = new WebSocket(`${location.protocol == 'http:' ? 'ws' : 'wss'}://${location.host}`);
    const wss_stream = new wstream(io);
    const charter = new chart(3000);

    io.onerror = function (event) {
        if (io.readyState !== io.OPEN) {
            $('#ui-preloader').css('display', '');
        }
    }

    io.onopen = function (event) {

        io.send(JSON.stringify({action: 'balance'}));
        io.send(JSON.stringify({action: 'indicators'}));
        io.send(JSON.stringify({action: 'conditions'}));
        io.send(JSON.stringify({action: 'positions'}));
        io.send(JSON.stringify({action: 'orders'}));
        io.send(JSON.stringify({action: 'price'}));
        io.send(JSON.stringify({action: 'console'}));
        io.send(JSON.stringify({action: 'users'}));
        io.send(JSON.stringify({action: 'connections'}));
        io.send(JSON.stringify({action: 'liquidations'}));
        io.send(JSON.stringify({action: 'priceHistory'}));
        io.send(JSON.stringify({action: 'volumeHistory'}));


        setInterval(function() {
            if (io.readyState === io.OPEN) {
                io.send(JSON.stringify({action: 'price'}));
                io.send(JSON.stringify({action: 'balance'}));
            } else {
                $('#ui-preloader').css('display', '');
            }
        }, 8000);

    }

    io.onmessage = function (event) {
        if (io.readyState === io.OPEN) {
            const response = JSON.parse(event.data);
            wss_stream.ws(response.action, response.data)   
        } else {
            $('#ui-preloader').css('display', '');
        }
    }


    /**
     * Получаем цены всех бирж
     */

    wss_stream.register('price', function (e=null) {
        if (typeof e == typeof []) {

            let time = Math.round(+new Date()/1000);
            let price = e[0];

            document.price = price;

        }

        wss_stream.send('price');
    });


    /**
     * Получаем объемы
     */

    wss_stream.register('volumeHistory', function (e=null) {
        if (typeof e == typeof []) {
            let volumes = e[0];
            window.chart.volume.setData(volumes.deribit.btc);
        }

        wss_stream.send('volumeHistory');
    });


    /**
     * Получяем всех пользователей, которые используют сокет соеденение.
     * Получаем всех активных пользователей в сети.
     */

    wss_stream.register('connections', function (e=null) {
        if (typeof e[0] == typeof []) {
            $("#users-list").text('');
            for (const device of e[0]) {
                $("#users-list").append(`<div class="user"> <i class="fa fa-circle user-online-indicator" aria-hidden="true"></i> <b>${'0'}</b>: ${device.ip}</div>`);
            }
        }

        wss_stream.send('connections');
    });


    /**
     * Получаем балансы всех бирж
     */

    wss_stream.register('balance', function (e=null) {
        if (typeof e == typeof []) {
            if (e[0].ret_msg == 'OK') {

                let balance = e[0].result.BTC.available_balance;
                let bybit_tpnl = e[0].result.BTC.cum_realised_pnl;
                let bybit_spnl = e[0].result.BTC.realised_pnl;
                let bybit_tpnl_usd = parseFloat(bybit_tpnl) * ('price' in document ? document.price.bybit.btc : 0);
                let bybit_spnl_usd = parseFloat(bybit_spnl) * ('price' in document ? document.price.bybit.btc : 0);

                $("#balance_bybit").text(balance ? parseFloat(balance).toFixed(4) : '0');

                $("#spnl_bybit").text(bybit_spnl_usd ? parseFloat(bybit_spnl_usd).toFixed(4) : '0')
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
            let deribit_tpnl_usd = parseFloat(deribit_tpnl) * ('price' in document ? document.price.deribit.btc : 0);
            let deribit_spnl_usd = parseFloat(deribit_spnl) * ('price' in document ? document.price.deribit.btc : 0);

            $("#balance_deribit").text(balance ? parseFloat(balance).toFixed(4) : '0');

            $("#spnl_deribit").text(deribit_spnl ? parseFloat(deribit_spnl).toFixed(4) : '0')
            $('#spnl_deribit_usd').text(deribit_spnl_usd ? parseFloat(deribit_spnl_usd).toFixed(2) : '0')

            $("#tpnl_deribit").text(deribit_tpnl ? parseFloat(deribit_tpnl).toFixed(4) : '0')
            $('#tpnl_deribit_usd').text(deribit_tpnl_usd ? parseFloat(deribit_tpnl_usd).toFixed(2) : '0')

            if (deribit_tpnl > 0) { $('#tpnl_deribit').addClass("pnl-up"); } else { $('#tpnl_deribit').addClass("pnl-down"); }
            if (deribit_spnl > 0) { $('#spnl_deribit').addClass("pnl-up"); } else { $('#spnl_deribit').addClass("pnl-down"); }

        }
    });


    /**
     * Получаем данные консоли
     */

    wss_stream.register('console', function (e=null) {
        if (typeof e == typeof []) {

            let error = e[0].UI.error;
            let text = e[0].UI.text;
            let console = e[0].UI.console;
            let chart = e[0].UI.chart;


            /**
             * Обрабатываем текст
             */

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

            /**
             * Обрабатываем ошибки
             */

            if (error) {
                $("div#primary-logic-error").css('display', 'block');
                $("div#primary-logic-error").text(error);
            } else {
                $("div#primary-logic-error").css('display', '');
                $("div#primary-logic-error").text('');
            }


            /**
             * Рисуем консоль
             */

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

            /**
             * Маркируем терминал
             */

            if (chart.markers.length > 0) {
                charter.set('exchange/markers', Object.assign(charter.get('exchange/markers'), chart.markers));
            }

            wss_stream.send('console');

        }
    });


    /**
     * Получаем данные индикаторов
     */

    wss_stream.register('indicators', function (e=null) {
        if (typeof e == typeof []) {

            let indicators = e[0];

            for (const e in indicators) {
                for (const e_ in indicators[e]) {
                    if (e != e_) {
                        let delta = indicators[e][e_].delta;

                        if (!$(`#delta-data-${e}-${e_}-value`).length) {
                            $('#deltas-list-body').append(`<tr> <td id="delta-data-${e}-${e_}-name">Delta name</td> <td id="delta-data-${e}-${e_}-value">0</td> </tr>`);
                        }

                        $(`#delta-data-${e}-${e_}-name`).text(`${e}/${e_}`);
                        $(`#delta-data-${e}-${e_}-name`).attr('class', delta > 0 ? 'up' : 'down');
                        $(`#delta-data-${e}-${e_}-name`).css('width', `${Math.abs(delta) > 70 ? 70 : delta}%`);
                        $(`#delta-data-${e}-${e_}-value`).text(parseFloat(delta).toFixed(2));
                        $(`#delta-data-${e}-${e_}-value`).attr('class', delta > 0 ? 'int-up' : 'int-down');

                    }
                }
            }

            wss_stream.send('indicators');

        }
    });


    /**
     * Получаем данные позиций
     */

    wss_stream.register('positions', function (e=null) {
        if (typeof e == typeof []) {

            let positions = e[0];

            $(`table#positions > tbody`).html("");

            for (const position of positions) {

                $(`table#positions > tbody`).append(`<tr height="32px" valign="center">
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

            wss_stream.send('positions');

        }
    });


    /**
     * Получаем данные ликвидаций
     */

    wss_stream.register('liquidations', function (e=null) {
        if (typeof e == typeof []) {

            let liquidations = e[0];

            if ('size' in liquidations) {
                $("#liquidation-list").html(`<div class="item ${liquidations.size == 'Sell' ? 'sell' : 'buy' }"> <span>BTC</span> <b class="value">${liquidations.leavesQty}</b> </div>`);
            }

            wss_stream.send('liquidations');

        }
    });


    /**
     * Получаем данные ордеров
     */

    wss_stream.register('orders', function (e=null) {
        if (typeof e == typeof []) {

            let orders = e[0];

            for (let i = 0; i < 10; i++) {
                $(`#bp${i}`).text(orders.bitmex.bids[i][0]);
                $(`#bq${i}`).text(orders.bitmex.bids[i][1]);
                $(`#bp${i}`).css('width', `${(orders.bitmex.bids[i][1] / 60000) < 50 ? orders.bitmex.bids[i][1] / 60000 : 50}%`)
            }

            for (let i = 0; i < 10; i++) {
                $(`#sp${i}`).text(orders.bitmex.asks[i][0]);
                $(`#sq${i}`).text(orders.bitmex.asks[i][1]);
                $(`#sp${i}`).css('width', `${(orders.bitmex.asks[i][1] / 60000) < 50 ? orders.bitmex.asks[i][1] / 60000 : 50}%`)
            }

            wss_stream.send('orders');

        }
    });


    /**
     * Получаем данные истории цен
     */

    wss_stream.register('priceHistory', function (e=null) {
        if (typeof e == typeof []) {

            let priceHistory = e[0];

            if ('bybit' in priceHistory) { window.chart.bybit.setData(priceHistory.bybit.btc); }
            if ('deribit' in priceHistory) { window.chart.deribit.setData(priceHistory.deribit.btc); }
            if ('bittrex' in priceHistory) { window.chart.bittrex.setData(priceHistory.bittrex.btc); }
            if ('bitmex' in priceHistory) { window.chart.bitmex.setData(priceHistory.bitmex.btc); }

            window.chart.bybit.setMarkers(charter.get('exchange/markers'));

            $("#exchange_chart_statusbar").text(`Connected!`);

            wss_stream.send('priceHistory');

        }
    });



});


