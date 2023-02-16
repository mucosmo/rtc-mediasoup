const axios = require('axios');

const cp = require('child_process');
const kill = require('tree-kill');

const request = axios.create({
    baseURL: 'https://cosmoserver.tk:4443/',
    timeout: 10000,
});

class DigitalHuman {

    constructor(params) {
        this.roomId = params.roomId;
        this.streamSrc = params.streamSrc;
        this.broadcasterId = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
        this.displayName = 'DH-TX';
        this.deviceName = 'GStreamer';
    }


    async start() {
        // 验证房间是否存在
        await request.get(`/rooms/${this.roomId}`);
        // 创建数字人
        await request.post(`rooms/${this.roomId}/broadcasters`, {
            id: this.broadcasterId,
            displayName: this.displayName,
            device: { 'name': this.deviceName }
        });

        // 创建 mediasoup audio plainTransport
        let audioTransport;
        await request.post(`rooms/${this.roomId}/broadcasters/${this.broadcasterId}/transports`, {
            type: 'plain',
            comedia: true,
            rtcpMux: false
        }).then(res => {
            audioTransport = res.data
        });
        // 创建 mediasoup audio plainTransport
        let videoTransport;
        await request.post(`rooms/${this.roomId}/broadcasters/${this.broadcasterId}/transports`, {
            type: 'plain',
            comedia: true,
            rtcpMux: false
        }).then(res => {
            videoTransport = res.data
        });

        const AUDIO_SSRC = 1111, AUDIO_PT = 100, VIDEO_SSRC = 2222, VIDEO_PT = 101

        // 创建 mediasoup audio producer
        await request.post(`/rooms/${this.roomId}/broadcasters/${this.broadcasterId}/transports/${audioTransport.id}/producers`, {
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

        }).then(res => {
            // videoTransport = res.data
        });


        // 创建 mediasoup video producer
        await request.post(`/rooms/${this.roomId}/broadcasters/${this.broadcasterId}/transports/${videoTransport.id}/producers`, {
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

        }).then(res => {
            // videoTransport = res.data
        });

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
            `rtpbin.send_rtp_src_0 ! udpsink host=${videoTransport.ip} port=${videoTransport.port}`,
            `rtpbin.send_rtcp_src_0 ! udpsink host=${videoTransport.ip} port=${videoTransport.rtcpPort} sync=false async=false`,
            `demux.audio`,
            `! queue`,
            `! decodebin`,
            `! audioresample`,
            `! audioconvert`,
            `! opusenc`,
            `! rtpopuspay pt=${AUDIO_PT} ssrc=${AUDIO_SSRC}`,
            `! rtpbin.send_rtp_sink_1`,
            `rtpbin.send_rtp_src_1 ! udpsink host=${audioTransport.ip} port=${audioTransport.port}`,
            `rtpbin.send_rtcp_src_1 ! udpsink host=${audioTransport.ip} port=${audioTransport.rtcpPort} sync=false async=false`
        ].join(' ');

        const dhcp = cp.spawn(command, {
            detached: false,
            shell: true
        })
        global.processObj[this.broadcasterId] = { roomId: this.roomId, pid: dhcp.pid };
    }

    /**
     * delete broadcaster
     * */
    static async delete(broadcasterId) {
        try {
            const { roomId, pid } = global.processObj[broadcasterId];
            await request.delete(`/rooms/${roomId}/broadcasters/${broadcasterId}`);
            kill(pid);
            delete global.processObj[broadcasterId];
            return { broadcasterId, pid }
        } catch (err) {
            return err.message;
        }
    }

}

module.exports.DigitalHuman = DigitalHuman;

