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
        this.rtpParameters = null;
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
        this.userId = params.userId || Math.random().toString(36).slice(2);
        this.peerId = 'node_' + this.userId;
        this.displayName = params.displayName || 'DH-TX';
        this.deviceName = params.deviceName || 'GStreamer';
        const wssBaseUrl = rtcConfig.RTC_SERVER_WSS_BASEURL;
        const protooUrl = `${wssBaseUrl}/?roomId=${this.roomId}&peerId=${this.peerId}`;
        this.client = await protooConnect(protooUrl);
        this.clientKey = getClientKey(this.roomId, this.peerId);
        global.client.set(this.clientKey, this.client);
    }

    async joinRoom() {
        const rtp = await request.post(`${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rtc/room/join`, {
            roomId: this.roomId,
            peerId: this.peerId,
            displayName: this.displayName,
            deviceName: this.deviceName
        });
        this.rtpParameters = rtp.data['rtpParameters'];
        this.audioTransport = rtp.data['audioTransport'];
        this.videoTransport = rtp.data['videoTransport'];
    }

    async pushStream(url) {
        await request.post(`${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rtc/room/push`, {
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
        const msg = JSON.stringify({ action: 'asr', roomId, peerId });
        this.ws.send(msg);
    }

    async pushAudio(roomId, peerId, audio) {
        await request.post(`${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rtc/room/audio/push`, {
            roomId,
            peerId,
            audio
        });
    }

    // execute ffmpeg command directly
    async execCommand(data) {
        await request.post(`${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rtc/room/command`, {
            data,
        })
    }

    // close protoo client from api
    static nodeLeave(data) {
        const { roomId, userId: peerId } = data;
        const key = getClientKey(roomId, peerId);
        const client = global.client.get(key);
        client.close();
    }

    on(eventName, callback) {
        this.eventEmitter.on(eventName, callback)
    }

    async socketConnect() {
        return new Promise((resolve, reject) => {
            const socketUrl = this.audioSocketUrl;
            const ws = new WebSocket(socketUrl);
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

    async socketClose() {
        this.ws.close();
    }
}

module.exports.RtcSDK = RtcSDK;