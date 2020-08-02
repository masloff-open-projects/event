if ((parseInt(new Date().getTime()/1000) - _.get('everyPriceWait_session') > 2)) {

    _.update('everyPriceWait_session', parseInt(new Date().getTime()/1000));

    try {
        if (typeof everyPriceWait === "function") {
            everyPriceWait ();
        }
    } catch (e) {
        UI.err(e.message);
    }

}