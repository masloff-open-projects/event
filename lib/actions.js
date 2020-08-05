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
        if (action in this.actions) { return this.actions.append(callback); } else { return this.actions = [callback]; }
        return false;
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
                    this.actions[act](data);
                } catch (e) {

                }
            }
        }
    }

}

module.exports = actions;