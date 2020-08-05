var require = { paths: { 'vs': '/complex/monaco/min/vs' } };

$(document).ready(function () {

    $.get("/get/script/user", function(data) {
        const editor = monaco.editor.create(document.getElementById('container'), {
            value: data,
            language: 'javascript',
            automaticLayout: true,
            theme: "vs-dark",
        });

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, function() {

            $.post("/set/script/user", {
                code: editor.getValue()
            }, function(data) {
                alert('Saved!');
            });

        });

    });

});

$(document).resize(function() {
    monaco.editor.layout();
});