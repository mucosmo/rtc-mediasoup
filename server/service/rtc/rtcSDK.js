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

    async joinRoom(params) {
        this.roomId = params.roomId || Math.random().toString(36).slice(2);
        this.userId = params.userId || Math.random().toString(36).slice(2);
        this.peerId = 'node_' + this.userId;
        this.language = params.language || 'zh';
        this.displayName = params.displayName || 'DH-TX';
        this.deviceName = params.deviceName || 'GStreamer';
        const wssBaseUrl = rtcConfig.RTC_SERVER_WSS_BASEURL;
        const protooUrl = `${wssBaseUrl}/?roomId=${this.roomId}&peerId=${this.peerId}&language=${this.language}`;
        this.client = await protooConnect(protooUrl);
        this.clientKey = getClientKey(this.roomId, this.peerId);
        global.client.set(this.clientKey, this.client);
    }

    async produce(params) {
        const profile = { roomId: this.roomId, peerId: this.peerId, language: this.language };
        const rtp = await request.post(`${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rtc/room/produce`, {
            roomId: this.roomId,
            peerId: this.peerId,
            profile,
            displayName: this.displayName,
            deviceName: this.deviceName,
            video: params.video,
            audio: params.audio
        });
        return rtp.data;
    }
    async pushStream(params) {
        const rtp = await this.produce({ video: params.video, audio: params.audio });
        if (params.video) {
            await this.pushVideo(params.video, rtp);
        }

        if (params.audio) {
            await this.pushAudio(params.audio, rtp);
        }
    }

    async pushVideo(url, rtp) {
        await request.post(`${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rtc/room/push`, {
            url,
            roomId: this.roomId,
            peerId: this.peerId,
            videoTransport: rtp.videoTransport,
        });
    }

    async pushAudio(url, rtp) {
        await request.post(`${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rtc/room/push`, {
            url,
            roomId: this.roomId,
            peerId: this.peerId,
            audioTransport: rtp.audioTransport
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

    async activeSpeaker() {
        const msg = JSON.stringify({ action: 'vad' });
        this.ws.send(msg);
    }

    async pushTTS(audio) {
        let rtp = null;
        if (!this.ttsJoined) {
            rtp = await this.produce({ audio: true });
            this.ttsJoined = true
        }
        await request.post(`${rtcConfig.RTC_SERVER_HTTPS_BASEURL}/rtc/room/push/tts`, {
            roomId: this.roomId,
            peerId: this.peerId,
            audioTransport: rtp?.audioTransport,
            audio,
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
                that.eventEmitter.emit('message', data)
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