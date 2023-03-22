const { v4: uuidv4 } = require('uuid');

const axios = require('axios');
const request = axios.create({
    baseURL: process.env.RTC_SERVER_HTTPS_BASEURL,
    timeout: 10000,
});

const { FfmpegCommand } = require('./ffmpeg');
const { StreamSession } = require('./session');

const audioUdp = `udp://0.0.0.0:${Math.floor(Math.random() * 10000)}`;

const TTSUDP = new Map();

class RtcServer {
    constructor(params) {
        this.rtpParameters = {
            AUDIO_SSRC: params.AUDIO_SSRC || 1111,
            AUDIO_PT: params.AUDIO_PT || 100,
            VIDEO_SSRC: params.VIDEO_SSRC || 2222,
            VIDEO_PT: params.VIDEO_PT || 101
        };
    }

    async produce(params) {
        this.sessionId = 'push_stream_' + uuidv4();
        const { roomId, peerId, displayName, deviceName } = params;
        // 验证房间是否存在
        await request.get(`/rooms/${roomId}`);
        try {
            await request.post(`rooms/${roomId}/broadcasters`, {
                id: peerId,
                displayName: displayName,
                device: { 'name': deviceName }
            });
        } catch (error) {
            console.error(error);
        }

        if (params.audio) {
            this.audioTransport = await this.produceAudio(roomId, peerId);
        }

        if (params.video) {
            this.videoTransport = await this.produceVideo(roomId, peerId);
        }

        const sessionId = StreamSession.getPushStreamSessionId(roomId, peerId);
        global.processObj[sessionId] = { roomId: roomId, broadcasterId: peerId };

        return {
            audioTransport: this.audioTransport,
            videoTransport: this.videoTransport,
            rtpParameters: this.rtpParameters
        }
    }

    async produceAudio(roomId, peerId) {
        // 创建 mediasoup audio plainTransport
        let res = await request.post(`rooms/${roomId}/broadcasters/${peerId}/transports`, {
            type: 'plain',
            comedia: true,
            rtcpMux: false
        })
        const audioTransport = res.data

        const { AUDIO_PT, AUDIO_SSRC } = this.rtpParameters;
        // 创建 mediasoup audio producer
        await request.post(`/rooms/${roomId}/broadcasters/${peerId}/transports/${audioTransport.id}/producers`, {
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
        return audioTransport;
    }

    async produceVideo(roomId, peerId) {
        const { VIDEO_PT, VIDEO_SSRC } = this.rtpParameters;
        // 创建 mediasoup video plainTransport
        const res = await request.post(`rooms/${roomId}/broadcasters/${peerId}/transports`, {
            type: 'plain',
            comedia: true,
            rtcpMux: false
        })
        const videoTransport = res.data

        // 创建 mediasoup video producer
        await request.post(`/rooms/${roomId}/broadcasters/${peerId}/transports/${videoTransport.id}/producers`, {
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
        return videoTransport;
    }

    async pushStream(params) {
        const sessionId = StreamSession.getPushStreamSessionId(params.roomId, params.peerId);
        global.processObj[sessionId]['pid'] = [];
        const rtp = params;
        rtp.rtpParameters = this.rtpParameters;
        let pid;

        if (rtp.videoTransport) {
            const video = getVideoCommand(rtp);
            pid = FfmpegCommand.execCommand(video, sessionId);
            global.processObj[sessionId]['pid'].push(pid);
        }

        if (rtp.audioTransport) {
            const audio = getAudioCommand(rtp);
            pid = FfmpegCommand.execCommand(audio, sessionId);
            global.processObj[sessionId]['pid'].push(pid);
        }
    }

    async pushTTS(params) {
        const fs = require('fs');
        const { roomId, peerId, audio } = params;
        const buffer = Buffer.from(audio, 'base64');
        const path = `/opt/dev/rtcSdk/files/tts/tts_${roomId}_${peerId}.wav`;
        fs.writeFileSync(path, buffer);

        const rtp = params;
        rtp.rtpParameters = this.rtpParameters;

        const key = `${roomId}_${peerId}`;
        let udpAddr = TTSUDP.get(key);

        if (!udpAddr) {
            // FIXME: 端口有冲突风险
            udpAddr = `udp://0.0.0.0:${10000 + Math.floor(Math.random() * 10000)}`;
            TTSUDP.set(key, udpAddr);
            rtp.url = udpAddr;
            const command = getAudioCommand(rtp);
            rtp.command = command;
            await this.execCommand(rtp);
        }

        const command = `ffmpeg -re -i ${path} -f mpegts ${udpAddr}`;
        params.command = command;
        params.peerId = '_udp' + params.peerId; // 避免 udp 写进程关闭时关闭读进程
        this.execCommand(params);
    }

    static leaveRoom(params) {
        const sessionId = StreamSession.getPushStreamSessionId(params.roomId, params.peerId);
        const session = new StreamSession({ sessionId });
        session.close();
    }

    // execute ffmpeg command directly
    async execCommand(params) {
        const sessionId = StreamSession.getPushStreamSessionId(params.roomId, params.peerId);
        if (!global.processObj[sessionId]) {
            global.processObj[sessionId] = { roomId: params.roomId, broadcasterId: params.peerId };
        }
        global.processObj[sessionId]['pid'] = [];
        const pid = FfmpegCommand.execCommand(params.command, sessionId);
        global.processObj[sessionId]['pid'].push(pid);
        return global.processObj;
    }

    pushAudio(params) {
        const fs = require('fs');
        const { roomId, peerId, audio } = params;
        const buffer = Buffer.from(audio, 'base64');
        const path = `/opt/dev/rtcSdk/files/tts/tts_${roomId}_${peerId}.wav`;
        fs.writeFileSync(path, buffer);
        const command = `ffmpeg -re -i ${path} -f mpegts ${audioUdp}`;
        params.command = command;
        this.execCommand(params);
    }

}

function getVideoCommand(rtp) {
    const input = `ffmpeg -re -stream_loop 10 -i ${rtp.url}`;
    const videoSink = [
        `-map "0:v" -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 2 `,
        `-ssrc ${rtp.rtpParameters.VIDEO_SSRC} -payload_type ${rtp.rtpParameters.VIDEO_PT}`,
        `-f rtp rtp://${rtp.videoTransport.ip}:${rtp.videoTransport.port}`
    ].join(' ');
    const command = `${input}  ${videoSink}`;
    return command;
}

function getAudioCommand(rtp) {
    // http://downsc.chinaz.net/Files/DownLoad/sound1/201906/11582.mp3
    const input = `ffmpeg -re -i ${rtp.url}`;
    const audioSink = [
        `-map "0:a" -c:a libopus -ac 1 -ssrc ${rtp.rtpParameters.AUDIO_SSRC} -payload_type ${rtp.rtpParameters.AUDIO_PT}`,
        `-f rtp rtp://${rtp.audioTransport.ip}:${rtp.audioTransport.port}`
    ].join(' ');
    const command = `${input}  ${audioSink}`;
    return command;
}





module.exports.RtcServer = RtcServer;