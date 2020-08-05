/**
 * Module for works with CSV files
 *
 * @version 1.0.0
 */

class csv {

    constructor(separator = ";") {
        this.file = false;
        this.separator = separator;
        this.fs = require('fs');
    }


    /**
     * The function of opening the file.
     *
     * @param file
     */

    open (file="") {
        this.file = file;
    }


    /**
     * The function of writing data to a file.
     * Accepts two types of data: text (CSV line) and list.
     *
     * @param data
     */

    write (data) {
        if (this.file && data) {
            this.fs.appendFile(this.file, `${typeof data == typeof [] ? data.join(this.separator) : data}\n`, function (err) {});
        }

        return false;
    }

}

module.exports = csv;