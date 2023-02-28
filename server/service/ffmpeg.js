// const commandExample = ffmpeg -protocol_whitelist tcp,rtmp,udp -i rtmp://liveplay.ivh.qq.com/live/m688346523238401  -filter_complex '[0:v]boxblur=3:1,drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=20[v0]' -map [v0] -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp rtp://121.5.133.154:10024
const { v4: uuidv4 } = require('uuid');
const kill = require('tree-kill');
const { exec } = require('child_process');
const { StreamSession } = require('./stream-session');


class FfmpegCommand {
    constructor(command) {
        this.command = command;
        this.sessionId = 'push_stream_' + uuidv4();
    }

    async rtpRoom() {
        const cp = exec(this.command);
        global.processObj[this.sessionId] = { pid: cp.pid };
        cp.on('message', message =>
            console.log('ffmpeg::process::message [pid:%d, message:%o]', cp.pid, message)
        )

        cp.on('error', err =>
            console.error('ffmpeg::process::error [pid:%d, message:%o]', cp.pid, err)
        )

        cp.stderr.on('data', data =>
            console.log('err:' + data)
        )

        cp.stdout.on('data', data =>
            console.log('data:' + data)
        )

        cp.once('close', () => {
            this.closeSession()
        });


    }

    async closeSession() {
        const streamSession = new StreamSession({ sessionId: this.channel.sessionId });
        await streamSession.close();
    }
}




module.exports.FfmpegCommand = FfmpegCommand;