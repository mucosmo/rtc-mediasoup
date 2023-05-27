const { exec } = require('child_process');
const { StreamSession } = require('./session');

const { activeSpeaker } = require('../service/vad');

const { redis } = require('./redis');

global.ffmpegStats = {};

global.ffmpegData = null;

global.mixerMap = new Map();

global.mixerStart = new Map();

global.preSession = new Map();

class FfmpegCommand {
    constructor() {
        this.frameMap = new Map();
    }

    static execCommand(command, sessionId, params) {
        if (params.peerId.includes('mixer')) {
            global.mixerStart.get(params.roomId) || global.mixerStart.set(params.roomId, new Date().getTime());
            const preSession = global.preSession.get(params.roomId);
            if (preSession) {
                const streamSession = new StreamSession({ sessionId: preSession });
                streamSession.close();
            }
            global.preSession.set(params.roomId, sessionId);
        }
        console.log('------- params:', params)
        const cp = exec(command);
        cp.stderr.on('data', data => {
            console.log('-- ffmpeg data:', data)
            progress(params, data)
            if (params.peerId.includes('mixer')) {
                const peerId = global.mixerMap.get(params.roomId);
                if (peerId) {
                    if (params.peerId === peerId) {
                        global.ffmpegData = data;
                    }
                } else {
                    global.mixerMap.set(params.roomId, params.peerId)
                }
                // global.ffmpegStats['currentFrame'] = parseFrame(data);
                // global.ffmpegStats['currentTime'] = parseTime(data);
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
            global.ffmpegData = null;
            global.mixerMap = new Map();
            // global.mixerStart.delete(params.roomId);
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


function parseFrame(data) {
    // frame=   10 fps=6.9 q=16.0 size=      45kB time=00:00:00.36 bitrate=1030.9kbits/s speed=0.249x
    const regex = /frame=\s*(\d+)/;
    const match = regex.exec(data);
    if (match) {
        const number = parseInt(match[1]);
        return number;
    }
    return 0;
}

// parse current timecode of executed ffmpeg command into seconds
function parseTime(data) {
    // frame=   10 fps=6.9 q=16.0 size=      45kB time=00:00:00.36 bitrate=1030.9kbits/s speed=0.249x
    let regex = /time=(\d{2}):(\d{2}):(\d{2}\.\d{1,3})/;
    let match = regex.exec(data);
    let ret = 0;
    if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseFloat(match[3]);
        ret = hours * 3600 + minutes * 60 + seconds;
    }
    return ret;
}

function progress(user, data) {
    const seconds = parseTime(data);
    const progress = seconds / user.duration;
    const key = `ppt2videoProgress:${user.roomId}_${user.peerId}`;
    if (progress > 0) {
        redis.set(key, JSON.stringify({ progress, occupied: progress < 0.95 ? true : false }), 24 * 60 * 60);
    }

}

module.exports.FfmpegCommand = FfmpegCommand;