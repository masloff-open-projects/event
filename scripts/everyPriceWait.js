/**
 * Code execute on ever price get and wait N seconds
 */

function changeEveryPriceWaitTime (seconds) {
    _.update('everyPriceWait_wait', parseInt(seconds));
}


if ((parseInt(new Date().getTime()/1000) - _.get('everyPriceWait_session') > (_.get('everyPriceWait_wait') ? _.get('everyPriceWait_wait') : 2))) {
    _.update('everyPriceWait_session', parseInt(new Date().getTime()/1000));
    if (typeof everyPriceWait === "function") {
        try {
            everyPriceWait();
        } catch (e) {
            UI.err(e.message)
        }
    }
}