/**
 * Initialization of the terminal server part
 *
 * @version 1.0.0
 */

module.exports = function (app=null, twig=null, fs=null) {

    const twig_context = {
        menu: [
            {
                id: 'main',
                text: 'Main',
                href: '/',
            },
            {
                id: 'accountsManager',
                text: 'Accounts Manager',
                href: '/manager/accounts',
            },
            {
                id: 'positionsHistory',
                text: 'Positions history',
                href: '/history/positions',
            },
        ]
    };

    app.get('/', function (req, res) {

        twig.render('index.html', twig_context).then((output) => {
            res.end(output);
        });

    });

    app.get('/code', function (req, res) {

        twig.render('logic.html', twig_context).then((output) => {
            res.end(output);
        });

    });

    app.get('/get/script/user', function (req, res) {
        res.send(fs.readFileSync(__dirname + "/../scripts/user.js") );
    });

    app.get('/view/:file', function (req, res) {

        twig.render('csv.html', twig_context).then((output) => {
            res.end(output);
        });

    })

    app.get('/manager/accounts', function (req, res) {

        twig.render('accounts.html', twig_context).then((output) => {
            res.end(output);
        });

    })

    app.get('/file/:file', function (req, res) {
        res.sendFile(__dirname + "/../db/" + req.params.file);
    })

    app.post('/set/script/user', function (req, res) {
        if ('code' in req.body) {
            fs.writeFileSync(__dirname + "/../scripts/user.js", req.body.code);
            res.sendStatus(200);
        }
    });

}