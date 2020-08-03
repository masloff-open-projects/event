if (typeof everyPrice === "function") {
    try {
        everyPrice ();
    } catch (e) {
        UI.err(e.message)
    }
}