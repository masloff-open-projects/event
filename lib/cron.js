class cron {

    constructor() {
        this.cron = require('cron').CronJob;;
    }

    register (time="* * * * * *", callback=null) {
        (new this.cron(time, callback, null, true, 'America/Los_Angeles')).start();
    }

}

module.exports = cron;