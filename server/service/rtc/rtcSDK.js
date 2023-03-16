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
        this.roomId = params.roomId || Math.random().toString(36).slice(2);
        this.peerId = 'node_' + (params.userId || Math.random().toString(36).slice(2));
        this.sessionId = 'push_stream_' + uuidv4();
        this.displayName = params.displayName || 'DH-TX';
        this.deviceName = params.deviceName || 'GStreamer';
        this.rtpParameters = {
            AUDIO_SSRC: params.AUDIO_SSRC || 1111,
            AUDIO_PT: params.AUDIO_PT || 100,
            VIDEO_SSRC: params.VIDEO_SSRC || 2222,
            VIDEO_PT: params.VIDEO_PT || 101
        };
        this.videoTransport = null;
        this.audioTransport = null;
        this.client = null;
        this.eventEmitter = new EventEmitter();
        this.ws = null;
        this.audioSocketUrl = params.audioSocketUrl || rtcConfig.RTC_AUDIO_WSS_BASEURL;
    }


    async createRoom() {
        const wssBaseUrl = rtcConfig.RTC_SERVER_WSS_BASEURL;
        const protooUrl = `${wssBaseUrl}/?roomId=${this.roomId}&peerId=${this.peerId}`;
        this.client = await protooConnect(protooUrl);
        const key = getClientKey(this.roomId, this.peerId);
        global.client.set(key, this.client);
    }


    async joinRoom() {
        // 验证房间是否存在
        await request.get(`/rooms/${this.roomId}`);
        await request.post(`rooms/${this.roomId}/broadcasters`, {
            id: this.peerId,
            displayName: this.displayName,
            device: { 'name': this.deviceName }
        });

        // 创建 mediasoup audio plainTransport
        let res = await request.post(`rooms/${this.roomId}/broadcasters/${this.peerId}/transports`, {
            type: 'plain',
            comedia: true,
            rtcpMux: false
        })
        this.audioTransport = res.data

        // 创建 mediasoup audio plainTransport
        res = await request.post(`rooms/${this.roomId}/broadcasters/${this.peerId}/transports`, {
            type: 'plain',
            comedia: true,
            rtcpMux: false
        })
        this.videoTransport = res.data

        const { AUDIO_PT, AUDIO_SSRC, VIDEO_PT, VIDEO_SSRC } = this.rtpParameters;
        // 创建 mediasoup audio producer
        await request.post(`/rooms/${this.roomId}/broadcasters/${this.peerId}/transports/${this.audioTransport.id}/producers`, {
            kind: 'audio',
            rtpParameters: {
                codecs: [
                    {
                        mimeType: 'audio/opus',
                        payloadType: AUDIO_PT,
                        clockRate: 48000,
                        channels: 2,
                        parameters: {
                            'sprop-stereo': 1
                        }
                    }
                ],
                encodings: [{
                    ssrc: AUDIO_SSRC
                }]
            },
        })

        // 创建 mediasoup video producer
        await request.post(`/rooms/${this.roomId}/broadcasters/${this.peerId}/transports/${this.videoTransport.id}/producers`, {
            kind: 'video',
            rtpParameters: {
                codecs: [
                    {
                        mimeType: 'video/vp8',
                        payloadType: VIDEO_PT,
                        clockRate: 90000
                    }
                ],
                encodings: [{
                    ssrc: VIDEO_SSRC
                }]
            },
        })

        const key = 'rtcProcess_' + this.sessionId;
    }

    async leaveRoom() {
        const key = getClientKey(this.roomId, this.peerId);
        const client = global.client.get(key);
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
                console.log(data);
                that.eventEmitter.emit('newAudioData', data)
            });

            ws.on('close', function close() {
                console.log('WebSocket client disconnected');
            });
        })
    }

    async pushAuido(roomId, userId) {

    }
}

module.exports.RtcSDK = RtcSDK;