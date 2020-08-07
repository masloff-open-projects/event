$(document).ready (function () {

    // Init chart
    window.chart_object = LightweightCharts.createChart(deals_chart, {
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
        localization: {
            dateFormat: 'yyyy/MM/dd',
        },
        timeScale: {
            rightOffset: 12,
            barSpacing: 3,
            fixLeftEdge: true,
            lockVisibleTimeRangeOnResize: true,
            rightBarStaysOnScroll: true,
            borderVisible: false,
            borderColor: '#fff000',
            visible: true,
            timeVisible: true,
            secondsVisible: false
        },
    });

    // Load deals file
    $.get(`/file/positions.csv`, function(content) {

        document.chartData = {};
        document.time = 0;
        document.documentSplice = 1;
        document.documentLenght = 312;

        const content_split = content.split("\n");
        const header = content_split[0].split(";");
        const body = content_split.slice(document.documentSplice, document.documentLenght).reverse();

        // Append header
        for (const value in header) {
            $("#deals_table_header_firstElement").append(`<th>${header[value]}</th>`)
        }

        // Append body
        for (const line in body) {

            const lineBody = body[line].split(";");
            if (index) {index++} else {var index = 1;}

            $("#deals_table_body").append(`<tr id="tr-${index}" height="32px" valign="center" ></tr>`)

            for (const value in lineBody) {

                // Formatting words
                switch (lineBody[value]) {

                    case "Buy":
                        formatValue = `<b class="int-up">${lineBody[value]}</b>`;
                        break;

                    case "Sell":
                        formatValue = `<b class="int-down">${lineBody[value]}</b>`;
                        break;

                    case "Deribit":
                        formatValue = `<b> <i style="color: #52AF99;">${lineBody[value]}</i> </b>`;
                        break;

                    case "ByBit":
                        formatValue = `<b> <i style="color: #ec9811;">${lineBody[value]}</i> </b>`;
                        break;

                    default:

                        switch (header[value]) {

                            case "Time":
                                time = parseInt(lineBody[value]);
                                formatValue = new Date(parseInt(lineBody[value]) * 1000).toLocaleTimeString("en-US")
                                break;

                            case "Size":
                                size = lineBody[value];
                                formatValue = `<b class="${lineBody[value] > 0 ? 'int-up' : 'int-down'}">${lineBody[value]} (${lineBody[value] > 0 ? 'LONG' : 'SHORT'})</b>`;
                                break;

                            default:
                                formatValue = lineBody[value];
                                break;
                        }
                }

                // Add to chart
                if (!(lineBody[0] in document.chartData)) {
                    document.chartData[lineBody[0]] = [];
                }

                // Add to chart
                if ( !((typeof time == "undefined" ) && (typeof size == "undefined" )) ) {

                    if (!(document.time == parseInt(typeof time == "undefined" ? 0 : time))) {

                        document.chartData[lineBody[0]].push ({
                            time: parseInt(typeof time == "undefined" ? 0 : time),
                            value: Math.abs(parseFloat(typeof size == "undefined" ? 0 : size)),
                        });

                    }

                    document.time = parseInt(typeof time == "undefined" ? 0 : time);

                }

                // Add to table
                $(`#tr-${index}`).append(`<td>${formatValue}</td>`)

            }


        }

        // Render chart
        for (const exchange in document.chartData) {

            // Chose color
            switch (exchange) {

                case "Deribit":
                    color = 'rgba(82, 175, 153, 1)';
                    break;

                case "ByBit":
                    color = 'rgba(236, 152, 17, 1)';
                    break;

                default:
                    color = 'rgba(47, 50, 64, 1)';
                    break;

            }

            window.chart_object.addLineSeries({
                color: color,
                lineStyle: 0,
                lineWidth: 2,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 6,
                lineType: 1,
            }).setData(document.chartData[exchange].reverse());
        }

    });

});