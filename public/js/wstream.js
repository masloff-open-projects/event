/**
 * Class for work with WSS Stream
 */

class wstream {

    constructor(wss={}) {
        this.actions = {};
        this.callback = {};
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
        if (action in this.actions) { return this.actions[action](data); }
        return false;
    }

    send (action="default", data={}) {
        if(this.wss.readyState === this.wss.OPEN) {
            this.wss.send(JSON.stringify({
                action: action,
                data: data
            }));
        }

    }

    on (on="default", callback={}) {
        if (!(on in this.callback)) {
            this.callback[on] = callback;
            return true;
        }
        return false;
    }

    call (on="default", data={}) {
        if (on in this.callback) { return this.callback[on](data); }
        return false;
    }

}