try {

    if (typeof everyPrice === "function") {
        everyPrice ();
    }

} catch (e) {
    UI.err(e.message);
}