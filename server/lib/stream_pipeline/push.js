const axios = require('axios');

const { v4: uuidv4 } = require('uuid');

const cp = require('child_process');

const request = axios.create({
    baseURL: 'https://chaosyhy.com:4443/',
    timeout: 10000,
});

class DigitalHuman {
    constructor(params) {
        this.roomId = params.roomId;
        this.streamSrc = params.streamSrc;
        this.broadcasterId = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
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
    }

    /**
     * open the transport channel to ready for stream pushing
     */
    async open() {
        // 验证房间是否存在
        await request.get(`/rooms/${this.roomId}`);
        // 创建数字人
        await request.post(`rooms/${this.roomId}/broadcasters`, {
            id: this.broadcasterId,
            displayName: this.displayName,
            device: { 'name': this.deviceName }
        });

        // 创建 mediasoup audio plainTransport
        let res = await request.post(`rooms/${this.roomId}/broadcasters/${this.broadcasterId}/transports`, {
            type: 'plain',
            comedia: true,
            rtcpMux: false
        })
        this.audioTransport = res.data

        // 创建 mediasoup audio plainTransport
        res = await request.post(`rooms/${this.roomId}/broadcasters/${this.broadcasterId}/transports`, {
            type: 'plain',
            comedia: true,
            rtcpMux: false
        })
        this.videoTransport = res.data

        const { AUDIO_PT, AUDIO_SSRC, VIDEO_PT, VIDEO_SSRC } = this.rtpParameters;
        // 创建 mediasoup audio producer
        await request.post(`/rooms/${this.roomId}/broadcasters/${this.broadcasterId}/transports/${this.audioTransport.id}/producers`, {
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
        await request.post(`/rooms/${this.roomId}/broadcasters/${this.broadcasterId}/transports/${this.videoTransport.id}/producers`, {
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

        global.processObj[this.sessionId] = { roomId: this.roomId, broadcasterId: this.broadcasterId };
    }


    async start() {
        await this.open();
        const { AUDIO_PT, AUDIO_SSRC, VIDEO_PT, VIDEO_SSRC } = this.rtpParameters;
        // 执行 gstreamer 命令
        const command = [
            `gst-launch-1.0`,
            'rtpbin name=rtpbin',
            `rtmpsrc location=${this.streamSrc} `,
            `! flvdemux  name=demux`,
            `demux.video`,
            `! queue`,
            `! decodebin`,
            `! videoconvert `,
            `! vp8enc target-bitrate=1000000 deadline=1 cpu-used=4`,
            `! rtpvp8pay pt=${VIDEO_PT} ssrc=${VIDEO_SSRC} picture-id-mode=2`,
            `! rtpbin.send_rtp_sink_0`,
            `rtpbin.send_rtp_src_0 ! udpsink host=${this.videoTransport.ip} port=${this.videoTransport.port}`,
            `rtpbin.send_rtcp_src_0 ! udpsink host=${this.videoTransport.ip} port=${this.videoTransport.rtcpPort} sync=false async=false`,
            `demux.audio`,
            `! queue`,
            `! decodebin`,
            `! audioresample`,
            `! audioconvert`,
            `! opusenc`,
            `! rtpopuspay pt=${AUDIO_PT} ssrc=${AUDIO_SSRC}`,
            `! rtpbin.send_rtp_sink_1`,
            `rtpbin.send_rtp_src_1 ! udpsink host=${this.audioTransport.ip} port=${this.audioTransport.port}`,
            `rtpbin.send_rtcp_src_1 ! udpsink host=${this.audioTransport.ip} port=${this.audioTransport.rtcpPort} sync=false async=false`
        ].join(' ');

        const dhcp = cp.spawn(command, {
            detached: false,
            shell: true
        });
        // global.processObj[this.sessionId].pid = dhcp.pid;
    }


}

module.exports.DigitalHuman = DigitalHuman;

