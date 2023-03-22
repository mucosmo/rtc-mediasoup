const { exec } = require('child_process');
const { StreamSession } = require('./session');

const { activeSpeaker } = require('../service/vad');

class FfmpegCommand {
    constructor() {
    }

    static execCommand(command, sessionId, params) {
        const cp = exec(command);
        cp.stderr.on('data', data => {
            if (params.mediaType === 'audio') {
                const volume = parseVolume(data);
                if (volume > -60) {
                    activeSpeaker({ peerId: params.peerId, roomId:params.roomId, volume });
                }
            }
        })
        cp.once('close', () => {
            const streamSession = new StreamSession({ sessionId });
            streamSession.close();
        });

        return cp.pid;
    }
}




function parseVolume(data) {
    const regex = /I:\s*(-?\d+(?:\.\d+)?)/;
    const match = regex.exec(data);
    if (match) {
        const number = parseFloat(match[1]);
        return number;
    }
}




module.exports.FfmpegCommand = FfmpegCommand;