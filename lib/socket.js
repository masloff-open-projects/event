/**
 * Handling WebSocket requests
 *
 * @version 1.0.0
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

                            try {

                                answer = JSON.stringify({
                                    action: response.action,
                                    data: e
                                });

                                answer ? io.send(answer) : false;

                            } catch (e) {  }

                        });

                        answer = false;

                    } else {
                        try {
                            answer = JSON.stringify(response);
                        } catch (e) {}
                    }

                }

                answer ? io.send(answer) : false;


            });

        });

    }


    /**
     * Get all active connections
     *
     * @returns {any}
     */

    connections () {
        return this.wss.connections;
    }


    /**
     * Unplug user
     *
     * @param ip
     */

    disconnect (ip='8.8.8.8') {
        for (const connection of this.wss.connections) {
            if (connection.remoteAddress == ip) {
                connection.close();
            }
        }

    }

}

module.exports = socket;