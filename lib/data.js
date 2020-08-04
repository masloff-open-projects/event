/**
 * Class for save/transport local data
 */

class data {

    constructor() {
        this.data = {};
        this.listen = {};
    }

    on (event='event', callback=false) {
        if (!(event in this.listen)) { this.listen[event] = []; }
        this.listen[event].push(callback);
    }

    set (key='default', value='default') {
        this.data[key] = value;
    }

    append (key='default', value='default') {
        if (!(key in this.data)) { this.data[key] = []; } else {
            if (!(typeof this.data[key] == typeof [])) { this.data[key] = []; }
        }
        this.data[key].push(value)
    }

    get (key='default') {
        if (key in this.data) { return this.data[key]; } else { return false; }
    }

}

module.exports = data;