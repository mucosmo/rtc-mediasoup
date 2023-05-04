const roomManager = require('../SDK/licodeSDK/roomManager');
const EventEmitter = require('events').EventEmitter;


class LicodeService {
    constructor(token, roomName, roomId) {
        this.token = token || 'eyJ0b2tlbklkIjoiNjQxMThkZDc1ODAyOTU1NDNiNmU4MTdjIiwiaG9zdCI6ImxpY29kZS5jYW5ueWNvLmNuOjgwODAiLCJzZWN1cmUiOnRydWUsInNpZ25hdHVyZSI6Ill6UTROMkppTURCaE1XVTNPVFZqWlRreE1XTmhNR0kzT0RNNE5EZGhPRGN4TmpnNE5EZ3pPUT09In0=';
        this.roomName = roomName || 'main';
        this.roomId = roomId || '6411633add626355f6e174a8';
        this.eventEmitter = new EventEmitter();
        this.open();
    }

    open() {
        this.room = roomManager.connect(this.token, this.roomName, () => { });
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
        const data = this.getLicodeMessage(sessionId, this.roomId, { msg: msg }, receivers, 'mixer');
        try {
            roomManager.sendGenericMessage(data);
        } catch (e) {
            console.error("failed to send locode message:", e);
        }
    }

    getLicodeMessage(sessionId, roomId, data, receivers, to) {
        return {
            roomId: roomId,
            data: {
                name: 'mixerAssets',
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