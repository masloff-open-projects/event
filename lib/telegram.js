/**
 * Класс для работы с телеграммом
 */

const TelegramBot = require('node-telegram-bot-api');

class telegram {

    constructor(token="", users={}) {
        this.bot = new TelegramBot(token, {polling: true});
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

    send (message="", user=false) {
        if (!user) {
            for (const u of this.users) {
                this.bot.sendMessage(u.id, message).catch(function(e) {

                });
            }
        }

    }

    register (command="", callback={}) {
        if (!(command in this.comamnds)) {this.comamnds[command] = []}
        this.comamnds[command].push(callback);
    }

}

module.exports = telegram;