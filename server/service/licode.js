const roomManager = require('../SDK/licodeSDK/roomManager');
const EventEmitter = require('events').EventEmitter;


class LicodeService {
    constructor(token, roomName) {
        this.token = token;
        this.roomName = roomName;
        this.eventEmitter = new EventEmitter();
        this.open();
    }

    open() {
        this.room = roomManager.connect(this.token, this.roomName);
        const that = this;
        if (this.room) {
            this.room.then(() => {
                that.eventEmitter.on("sendLicodeMessage", that.sendLicodeMessage);
            });
        } else {
            that.eventEmitter.removeListener("sendLicodeMessage", this.sendLicodeMessage);
            that.eventEmitter.on("sendLicodeMessage", this.sendLicodeMessage);
        }
    }

    sendLicodeMessage(msg) {
        console.log('发送消息给Licode====')
        const sessionId = 'msrtc_100001';
        const receivers = ['default']
        const data = this.getLicodeMessage(sessionId, this.roomName, { msg: msg}, receivers);
        console.log(data)
        try {
            roomManager.sendGenericMessage(data);
        } catch (e) {
            logger.error("sendLicodeMessage", e);
        }
    }

    getLicodeMessage(sessionId, roomId, data, receivers, to) {
        return {
            roomId: roomId,
            data: {
                sessionId: sessionId,
                event: data,
                to: to || "client",
                sourceRoom: roomId,
            },
            options: {
                receivers: receivers,
            },
        };
    }

}




module.exports.LicodeService = LicodeService;