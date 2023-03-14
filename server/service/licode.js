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
        this.room = roomManager.connect(this.token, this.roomName, ()=>{});
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
        const sessionId = 'msrtc_100001';
        const receivers = ['default'];
        const roomId = '630322799a94c5505b9b2a16';
        const data = this.getLicodeMessage(sessionId, roomId, { msg: msg}, receivers, 'mixer');
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
                name:'mixerAssets',
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