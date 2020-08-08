/**
 * The script is called by the Cron
 * scheduler every second.
 */

if (typeof everySecond === "function") {

    try {
        everySecond ();
    } catch (e) {
        UI.err(e.message);
    }

}