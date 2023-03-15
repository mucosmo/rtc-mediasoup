const protooClient = require('protoo-client');
const redisService = require("../redis.js").RedisService;
const { v4: uuidv4 } = require('uuid');

const rtcConfig = require('./rtcConfig.js');

const axios = require('axios');
const request = axios.create({
    baseURL: rtcConfig.RTC_SERVER_HTTPS_BASEURL,
    timeout: 10000,
});

global.client = new Map();

function getClientKey(roomId, peerId) {
    return 'rtcClient_' + roomId + peerId;
}

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
    }


    async createRoom() {
        const wssBaseUrl = rtcConfig.RTC_SERVER_WSS_BASEURL;
        const protooUrl = `${wssBaseUrl}/?roomId=${this.roomId}&peerId=${this.peerId}`;
        this.client = await protooConnect(protooUrl);
        const key = getClientKey(this.roomId, this.peerId);
        redisService.set(key, this.client, 24 * 60 * 60);
        global.client.set(key, this.client);
    }

    /**
     * open the transport channel to ready for stream pushing
     */
    async joinRoom() {
        // 验证房间是否存在
        await request.get(`/rooms/${this.roomId}`);
        // 创建数字人
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
                        mimeType: "audio/opus",
                        payloadType: AUDIO_PT,
                        clockRate: 48000,
                        channels: 2,
                        parameters: {
                            "sprop-stereo": 1
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
                        mimeType: "video/vp8",
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
        redisService.set(key, JSON.stringify({ roomId: this.roomId, broadcasterId: this.peerId }));
    }

    async leaveRoom() {
        const key = getClientKey(this.roomId, this.peerId);
        // const client = new protooClient.Peer(JSON.parse(await redisService.get(key)));
        const client = global.client.get(key);
        client.close();
    }

    async pullAudio(roomId, userId) {

    }

    async pushAuido(roomId, userId) {

    }

    async pushVideo() {

    }


}

module.exports.RtcSDK = RtcSDK;