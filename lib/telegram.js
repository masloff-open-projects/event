/**
 * Класс для работы с телеграммом
 */

const TelegramBot = require('node-telegram-bot-api');

class telegram {

    constructor(token="", users={}) {
        this.bot = new TelegramBot(token, {polling: true});
        this.users = users;
    }

    send (message="", user=false) {
        if (!user) {
            for (const u of this.users) {
                this.bot.sendMessage(u.id, message).catch(function(e) {

                });
            }
        }

    }

    listen () {

        this.bot.onText(/\/echo (.+)/, (msg, match) => {
            const chatId = msg.chat.id;
            const resp = match[1]; // the captured "whatever"

            // send back the matched "whatever" to the chat
            this.bot.sendMessage(chatId, resp);
        });

    }

}

module.exports = telegram;