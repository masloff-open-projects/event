/**
 * Класс для работы с хуками
 */

class actions {

    constructor() {
        this.actions = {}
    }

    register (action="default", callback) {
        if (action in this.actions) { return this.actions.append(callback); } else { return this.actions = [callback]; }
        return false;
    }

    call (action="default", data={}) {
        if (action in this.actions) {
            for (const act in this.actions) {
                try {
                    this.actions[act](data);
                } catch (e) {

                }
            }
        }
    }

}

module.exports = actions;