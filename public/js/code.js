$(document).ready(function () {
    if (!('logic_editor' in window)) {

        $.get("/get/script/user", function(data) {
            $("#logic_textarea").text(data);

            window.logic_editor = CodeMirror.fromTextArea(logic_textarea, {
                lineNumbers: true,
                styleActiveLine: true,
                matchBrackets: true,
                mode: "text/javascript",
                // keyMap: "sublime",
                theme: 'darcula',
                autoCloseTags: true,
                lineWrapping: true,
                extraKeys: {
                    "Ctrl-R": function() {
                        // do something
                    },
                    "Ctrl-S": function() {

                        $.post("/set/script/user", {
                            code: window.logic_editor.getValue()
                        }, function(data) {
                            alert('Saved!');
                        });

                    },
                    "Ctrl": "autocomplete"
                }
            });
            window.logic_editor.on("keyup", function (cm, event) {
                if (event.keyCode != 13 && event.keyCode != 39 && event.keyCode != 37 && event.keyCode != 8 && !cm.state.completionActive) {
                    clearTimeout(window.cm_autocomplite);
                    window.cm_autocomplite = setTimeout(function () {
                        CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
                    }, 1550);

                } else if (event.keyCode == 13 || event.keyCode == 8) {
                    clearTimeout(window.cm_autocomplite);
                }
            });

        });

    }
});