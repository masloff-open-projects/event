if ((parseInt(new Date().getTime()/1000) - _.get('everyPriceWait_session') > 2)) {

    _.update('everyPriceWait_session', parseInt(new Date().getTime()/1000));

    if (typeof everyPriceWait === "function") {
        try {
            everyPriceWait();
        } catch (e) {
            UI.error = (e.message);
        }
    }


}