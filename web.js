const fs = require ('fs');

function web (app, express) {

    app.use(express.static(__dirname + '/public'));

    app.get('/', function (req, res) {
        res.sendFile(__dirname + "/html/index.html");
    });

    app.get('/code', function (req, res) {
        res.sendFile(__dirname + "/html/logic.html");
    });

    app.get('/get/script/user', function (req, res) {
        res.sendFile(__dirname + "/scripts/user.js");
    });

    app.post('/set/script/user', function (req, res) {
        if ('code' in req.body) {
            fs.writeFileSync(__dirname + "/scripts/user.js", req.body.code)
        }
        res.sendStatus(200);
    });

}

module.exports = web;