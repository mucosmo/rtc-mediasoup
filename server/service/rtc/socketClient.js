const WebSocket = require('ws');

class SocketClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
    }

    connect() {
        const ws = new WebSocket(this.url);
        ws.on('open', function open() {
            console.log('WebSocket client connected');
        });

        ws.on('message', function incoming(data) {
            console.log(data);
        });

        ws.on('close', function close() {
            console.log('WebSocket client disconnected');
        });

        this.ws = ws;
    }

    send(data) {
        this.ws.send(data);
    }
}

module.exports.SocketClient = SocketClient;
