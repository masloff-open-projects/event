/**
 * The function allows you to connect to exchange socket-outlets and
 * to give the callbacks to commit *
 * certain actions
 *
 * @param wss
 * @param send
 * @param callback
 * @param recursion
 * @param reconnect
 */

function stream_wws (wss='wss://', send="", callback=null, recursion=false, reconnect=true) {

    const W3CWebSocket = require('websocket').w3cwebsocket;
    const client = new W3CWebSocket(wss);

    client.onerror = function() { if (reconnect) { stream_wws(wss, send, callback, recursion, reconnect); } else { throw 'Connection Error' }; };
    client.onclose = function() { if (reconnect) { stream_wws(wss, send, callback, recursion, reconnect); } else { throw 'Client Closed'; } };
    client.onopen = function() { client.send(send); };
    client.onmessage = function(e) { if ('onmessage' in callback) {callback.onmessage(e.data);} if (recursion) { client.send(send); } if ('every' in callback) {callback.every(e.data)} };

}

module.exports = stream_wws;