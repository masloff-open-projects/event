/**
 * Module for works with CSV files
 */

const fs = require('fs');

class csv {

    constructor(separator = ";") {
        this.file = false;
        this.separator = separator;
    }

    open (file="") {
        this.file = file;
    }

    write (data) {
        if (this.file) {
            try {
                fs.appendFile(this.file, `${typeof data == typeof [] ? data.join(this.separator) : data}\n`, function (err) {
                    if (err) throw err;
                });
            } catch (e) {}
        }
    }

}

module.exports = csv;