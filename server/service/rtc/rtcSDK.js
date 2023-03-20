const protooClient = require('protoo-client');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');

const rtcConfig = require('./rtcConfig.js');

const axios = require('axios');
const request = axios.create({
    baseURL: rtcConfig.RTC_SERVER_HTTPS_BASEURL,
    timeout: 10000,
});

global.client = new Map();

const EventEmitter = require('events').EventEmitter;

async function protooConnect(protooUrl) {
    return new Promise((resolve, reject) => {
        const protooTransport = new protooClient.WebSocketTransport(protooUrl);
        const client = new protooClient.Peer(protooTransport);
        client.on('open', () => {
            resolve(client)
        })

        client.on('failed', () => {
            console.log('protoo connection failed');
        })

        client.on('disconnect', () => {
            console.log('protoo disconnect');

        })

        client.on('close', () => {
            console.log('protoo connection closed');

        })
    })
}

function getClientKey(roomId, peerId) {
    return 'rtcClient_' + roomId + peerId;
}

class RtcSDK {
    constructor(params) {
        this.videoTransport = null;
        this.audioTransport = null;
        this.client = null;
        this.eventEmitter = new EventEmitter();
        this.ws = null;
        this.audioSocketUrl = params.audioSocketUrl || rtcConfig.RTC_AUDIO_WSS_BASEURL;
        this.clientKey = null;
    }


    async createRoom(params) {
        this.roomId = params.roomId || Math.random().toString(36).slice(2);
        this.peerId = 'node_' + (params.userId || Math.random().toString(36).slice(2));
        this.displayName = params.displayName || 'DH-TX';
        this.deviceName = params.deviceName || 'GStreamer';
        const wssBaseUrl = rtcConfig.RTC_SERVER_WSS_BASEURL;
        const protooUrl = `${wssBaseUrl}/?roomId=${this.roomId}&peerId=${this.peerId}`;
        this.client = await protooConnect(protooUrl);
        this.clientKey = getClientKey(this.roomId, this.peerId);
        global.client.set(this.clientKey, this.client);
    }


    async joinRoom() {
        const rtp = await request.post(`/rtc/room/join`, {
            roomId: this.roomId,
            peerId: this.peerId,
            displayName: this.displayName,
            deviceName: this.deviceName
        });
        this.audioTransport = rtp.data['audioTransport'];
        this.videoTransport = rtp.data['videoTransport'];
    }

    async pushStream(url) {
        await request.post(`/rtc/room/push`, {
            url,
            roomId: this.roomId,
            peerId: this.peerId,
            videoTransport: this.videoTransport,
            audioTransport: this.audioTransport,
        });
    }


    async leaveRoom() {
        const client = global.client.get(this.clientKey);
        client.close();
    }

    async roomStats() {
        const url = `${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rooms/stats`;
        const ret = await request.post(url);
        return ret.data;
    }

    async pullAudio(roomId, peerId) {
        const msg = JSON.stringify({ action: 'asrReady', roomId, peerId });
        this.ws.send(msg);
    }

    on(eventName, callback) {
        this.eventEmitter.on(eventName, callback)
    }

    async socketConnect() {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(this.audioSocketUrl);
            this.ws = ws;
            ws.on('open', function open() {
                resolve(ws);
            });
            const that = this;
            ws.on('message', function incoming(data) {
                that.eventEmitter.emit('newAudioData', data)
            });
            ws.on('close', function close() {
                console.log('WebSocket client disconnected');
            });
        })
    }

    async pushAudio(roomId, peerId, audio) {
        const msg = JSON.stringify({ action: 'tts', roomId, peerId, audio });
        this.ws.send(msg);
    }


}

module.exports.RtcSDK = RtcSDK;