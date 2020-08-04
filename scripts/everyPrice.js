/**
 * Code execute on ever price get
 */

if (typeof everyPrice === "function") {
    try {
        everyPrice ();
    } catch (e) {
        UI.err(e.message)
    }
}