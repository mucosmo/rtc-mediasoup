const axios = require('axios');

const config = require('../config')

const request = axios.create({
    baseURL: config.https.baseUrl,
    timeout: 10000,
});


const kill = require('tree-kill');

class StreamSession {
    constructor(params) {
        this.sessionsId = params.sessionId;
    }

    async close() {
        const sessionId = this.sessionsId;
        switch (true) {
            case sessionId.startsWith('push_stream_'):
                return await deleteDh(sessionId);
            case sessionId.startsWith('live_stream_'):
                return await closeLiveStream(sessionId);
            default:
                return (`session id ${sessionId} is not valid`);
        }
    }

    static getPushStreamSessionId(roomId, peerId) {
        return 'push_stream_' + roomId + '_' + peerId;
    }


    get() {
        return this.sessions;
    }
}

/**
* delete digital human broadcaster
*/
async function deleteDh(sessionId) {
    try {
        const { roomId, pid, broadcasterId } = global.processObj[sessionId];
        if (roomId && broadcasterId) {
            await request.delete(`/rooms/${roomId}/broadcasters/${broadcasterId}`);
        }
        
        pid.map(p => {
            kill(p);
        })
        delete global.processObj[sessionId];
        return { broadcasterId, pid, sessionId }
    } catch (err) {
        return err.message;
    }
}


/**
 * close the live stream
 */
async function closeLiveStream(sessionId) {
    try {
        const { pid } = global.processObj[sessionId];
        pid && kill(pid);
        delete global.processObj[sessionId];
        return { pid, sessionId }
    } catch (err) {
        return err.message;
    }
}


module.exports.StreamSession = StreamSession;