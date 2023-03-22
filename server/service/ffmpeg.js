// const commandExample = ffmpeg -protocol_whitelist tcp,rtmp,udp -i rtmp://liveplay.ivh.qq.com/live/m688346523238401  -filter_complex '[0:v]boxblur=3:1,drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=20[v0]' -map [v0] -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp rtp://121.5.133.154:10024
const { v4: uuidv4 } = require('uuid');
const kill = require('tree-kill');
const { exec } = require('child_process');
const { StreamSession } = require('./session');


class FfmpegCommand {
    constructor() { }

    static execCommand(command, sessionId) {
        const cp = exec(command);
        cp.stderr.on('data', data => {
            if (!command.includes('udp://0.0.0.0:1234')) return;
            console.log('==execCommand --err:' + data)
        })
        cp.once('close', () => {
            const streamSession = new StreamSession({ sessionId });
            streamSession.close();
        });

        return cp.pid;
    }
}




module.exports.FfmpegCommand = FfmpegCommand;