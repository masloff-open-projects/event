var global = {
    main: 0,
    init: 1
};

class ___ {

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

var _ = new ___ ();

try {

    if (typeof init === "function") {
        init ();
    }

} catch (e) {
    UI.err(e.message);
}