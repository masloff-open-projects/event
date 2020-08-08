/**
 * The script is called every 15 minutes by the Cron
 * scheduler every second.
 */

if (typeof sometimes === "function") {

    try {
        sometimes ();
    } catch (e) {
        UI.err(e.message);
    }

}