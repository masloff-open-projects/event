/**
 * Telegram class
 *
 * @version 1.0.0
 */


class telegram {

    constructor(token="", users={}) {
        this.telegram = require('node-telegram-bot-api');
        this.bot = new this.telegram(token, {polling: true});
        this.users = users;
        this.comamnds = {};

        this.bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            if (msg.text in this.comamnds) {
                for (const call in this.comamnds[msg.text]) {
                    this.bot.sendMessage(chatId, (this.comamnds[msg.text][call](msg)));
                }
            }
        });

    }


    /**
     * Send message in telegrams
     *
     * @param message
     * @param user
     */

    send (message="", user=false) {
        if (!user) {
            for (const u of this.users) {
                this.bot.sendMessage(u.id, message).catch(function(e) {

                });
            }
        }

    }


    /**
     * Register the reaction to an incoming message in the telegram
     *
     * @param command
     * @param callback
     */

    register (command="", callback={}) {
        if (!(command in this.comamnds)) {this.comamnds[command] = []}
        this.comamnds[command].push(callback);
    }


    /**
     * Records a hook waiting for a class telegram event
     *
     * @param action
     * @param callback
     */

    on (action="default", callback={}) {
        this.bot.on(action, callback);
    }

}

module.exports = telegram;