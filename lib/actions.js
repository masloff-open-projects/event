/**
 * Class for working with hooks,
 * which are caused by certain terminal states
 *
 * @version 1.0.0
 */

class actions {

    constructor() {
        this.actions = {}
    }


    /**
     * Function to register a hook
     *
     * @param action
     * @param callback
     * @returns {boolean|*[]|*}
     */

    register (action="default", callback) {
        if (!(action in this.actions)) { this.actions[action] = []; }
        return this.actions[action].push(callback);
    }


    /**
     * Function to output all registered hook functions
     *
     * @param action
     * @param data
     */

    call (action="default", data={}) {
        if (action in this.actions) {
            for (const act in this.actions) {
                try {
                    for (const _ in this.actions[act]) {
                        this.actions[act][_](data, this)
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        }
    }

}

module.exports = actions;