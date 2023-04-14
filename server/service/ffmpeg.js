const { exec } = require('child_process');
const { StreamSession } = require('./session');

const { activeSpeaker } = require('../service/vad');

global.currentFrame = 0;

class FfmpegCommand {
    constructor() {
        this.frameMap = new Map();
    }

    static execCommand(command, sessionId, params) {
        console.log('------- params:', params)
        const cp = exec(command);
        cp.stderr.on('data', data => {
            console.log('---data', data)
            if(params.peerId.includes('mixer')){
                global.currentFrame = parseFrame(data);
            }
            if (params.mediaType === 'audio') {
                const volume = parseVolume(data);
                if (volume > -60) {
                    activeSpeaker({ peerId: params.peerId, roomId: params.roomId, volume });
                }
            }
        })
        cp.once('close', () => {
            console.log('-- complete executing command --', params.peerId)
            global.currentFrame = 0;
            const streamSession = new StreamSession({ sessionId });
            streamSession.close();
        });

        return cp.pid;
    }

    static async executeTts(command, sessionId, params) {
        return new Promise((resolve, reject) => {
            const cp = exec(command);
            const pid = cp.pid;
            global.processObj[sessionId]['pid'].push(pid);
            cp.stderr.on('data', data => {
                if (params.mediaType === 'audio') {
                    const volume = parseVolume(data);
                    if (volume > -60) {
                        activeSpeaker({ peerId: params.peerId, roomId: params.roomId, volume });
                    }
                }
            })
            cp.once('close', () => {
                const streamSession = new StreamSession({ sessionId });
                streamSession.close();
                resolve(pid);
            });
        })

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


function parseFrame(data){
    // frame=   10 fps=6.9 q=16.0 size=      45kB time=00:00:00.36 bitrate=1030.9kbits/s speed=0.249x
    const regex = /frame=\s*(\d+)/;
    const match = regex.exec(data);
    if (match) {
        const number = parseInt(match[1]);
        return number;
    }
    return 0;
}



module.exports.FfmpegCommand = FfmpegCommand;