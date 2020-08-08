/**
 * This script creates an environment.
 * It runs before all the scripts that can be run in the program.
 * Init runs with the following priority
 */

var __exports__ = {};
var __boot_time__ = time();
var __dir__ = cwd()

function __boot_url (str=null) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

function include (url=null) {
    if (url) {

        if (__boot_url(url)) {

            const __code = request('GET', url).getBody('utf8');

            if (__code) {

                try {
                    eval(__code)
                } catch (e) {
                    UI.err(`Import Executer: ${e.message}`);
                }

            } else {
                UI.err(`Import: The CDN reverser returned a blank answer`);
            }

        } else {

            try {
                readExt(url)
                eval(readExt(url))
            } catch (e) {
                UI.err(`Import Executer: ${e.message}`);
            }

        }


    } else {
        UI.err(`Import: The function has adopted a value that is not suitable for processing. You must specify a link to the file`);
    }

    return __exports__;
}