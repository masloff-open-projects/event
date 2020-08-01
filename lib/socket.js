/**
 * Обработчк запросов WebSocket
 */

class socket {

    constructor(wss={}, events) {

        this.wss = wss;

        (this.wss).on('request', function(request) {

            const io = request.accept(null, request.origin);

            io.on('message', function (e) {

                let response = events(e);
                let answer = "";

                if (typeof response == typeof {}) {

                    if ('data' in response && typeof response.data == typeof Promise.all([Promise])) {

                        (response.data).then(function(e) {

                            answer = JSON.stringify({
                                action: response.action,
                                data: e
                            });

                            answer ? io.send(answer) : false;

                        });

                        answer = false;

                    } else {
                        answer = JSON.stringify(response);
                    }

                }

                answer ? io.send(answer) : false;


            });

        });

    }

    connections () {

        return this.wss.connections;

    }

}

module.exports = socket;