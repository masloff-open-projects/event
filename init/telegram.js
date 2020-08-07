/**
 * Telegram initialization
 *
 * @version 1.0.0
 */

module.exports = function (telegram=null) {

    telegram.register('/pnl', function () {

    });

    telegram.on('polling_error', function () {});
    telegram.on('webhook_error', function () {});

}