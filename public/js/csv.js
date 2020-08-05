$(document).ready(function() {

    $.get(`/file/${location.pathname.split('/')[location.pathname.split('/').length - 1]}`, function(content) {

        var data = Papa.parse(content.split("\n").reverse().slice(0, 100).join("\n"), {
            header: true,
            skipEmptyLines: true,
        })

        Handsontable(document.getElementById('handsontable-container'), {
            data: data.data,
            rowHeaders: true,
            columnSorting: true,
            colHeaders: true,
            contextMenu: true,
        });

    });

})