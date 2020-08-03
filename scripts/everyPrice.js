if (typeof everyPrice === "function") {
    try {
        everyPrice ();
    } catch (e) {
        UI.error = (e.message);
    }
}