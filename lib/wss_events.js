/**
 * WWS event handler.
 * The WWS event handler handles all events sent through a socket connection.
 * handler.
 *
 * wss is a function that is called at every WebSocket request
 * register - registration of user actions when requesting to wws
 */

class wws_events {

    constructor() {
        this.events = {};
    }


    /**
     * Handles incoming requests on a WSS feed
     *
     * @param e
     * @param ex
     * @returns {{data: *, action: (*|boolean)}}
     */

    wss (e, ex=this) {
        if (e.type == 'utf8') {

            try {

                let request = JSON.parse(e.utf8Data);
                let action = 'action' in request ? request.action : false;
                let this_ = this ? this : ex;

                if (action) {
                    if (action in this_.events) {

                        let response = this_.events[action](request);

                        return {
                            action: action,
                            data: response
                        };

                    }
                }

            } catch (e) {

            } finally {

            }
        }
    }


    /**
     * Register a handler for an incoming request
     *
     * @param action
     * @param callback
     * @returns {boolean}
     */

    register (action='default', callback={}) {

        if (!(action in this.events)) {
            this.events[action] = callback;
        }

        return false;

    }

}

module.exports = wws_events;