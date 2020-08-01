/**
 * Обработчик событий WWS.
 * Все события, отправляемые через сокет соединение обрабатывает именно этот
 * обработчик.
 *
 * wss - функция, которая вызываеться при каждом запросе WebSocket
 * register - регистрация пользовательских действий при запросе к wws
 */

class wws_events {

    constructor() {
        this.events = {};
    }

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

    register (action='default', callback={}) {

        if (!(action in this.events)) {
            this.events[action] = callback;
        }

        return false;

    }

}

module.exports = wws_events;