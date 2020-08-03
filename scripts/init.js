var global = {
    main: 0,
    init: 1
};

class __ {

    constructor() {
        this.data = {}
    }

    update (k="default", v="default") {
        this.data[k] = v;
    }

    set (k="default", v="default") {
        if (!(k in this.data)) {
            this.data[k] = v;
        } else {
            return false;
        }
    }

    get (k="default") {
        if (k in this.data) {
            return this.data[k];
        } else {
            return false;
        }
    }

}

const _ = new __ ();

try {

    if (typeof init === "function") {
        init ();
    }

} catch (e) {
    UI.err(e.message);
}