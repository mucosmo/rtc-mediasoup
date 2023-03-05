/**
 * 该文件用户拉流（从会话房间拉流，然后推送给外部（ASR 语音识别，playUrl 直播地址）
 */

const GStreamerLive = require('../gstreamer/command-playurl')

const GStreamerComposite = require('../gstreamer/stream-composite')

const fs = require('fs')

const kill = require('tree-kill');
const { v4: uuidv4 } = require('uuid');


/**
 *  把房间的音视频流转化成直播地址
 */
module.exports.liveStreamUrl = (roomId, peerId) => {
    const recordInfo = global.streamInfo[roomId][peerId]
    if (!fs.existsSync(`/opt/application/tx-rtcStream/files/${recordInfo.fileName}`)) {
        const consumers = global.streamInfo[roomId][peerId]["consumers"]
        global.peer.process = new GStreamerLive(recordInfo);
        setTimeout(async () => {
            for (const [id, consumer] of consumers) {
                // Sometimes the consumer gets resumed before the GStreamer process has fully started
                // so wait a couple of seconds
                await consumer.resume();
                await consumer.requestKeyFrame();
            }
        }, 1000);
    }

    const filePath = `${recordInfo.fileName}/mediasoup_live.m3u8`
    const sessionId = `live_stream_${uuidv4()}`;
    global.processObj[sessionId] = { pid: global.peer.process._process.pid };
    return { sessionId, liveUrl: `https://chaosyhy.com:60125/files/m3u8/${filePath}` }
}


/**
 *  拉取房间流并进行合成
 */
module.exports.streamComposite = (roomId, peerId) => {
    const recordInfo = global.streamInfo[roomId][peerId]

    const consumers = global.streamInfo[roomId][peerId]["consumers"]
    global.peer.process = new GStreamerComposite(recordInfo);
    setTimeout(async () => {
        for (const [id, consumer] of consumers) {
            // Sometimes the consumer gets resumed before the GStreamer process has fully started
            // so wait a couple of seconds
            await consumer.resume();
            await consumer.requestKeyFrame();
        }
    }, 1000);
    const sessionId = `synthesis_stream_${uuidv4()}`;
    global.processObj[sessionId] = { pid: global.peer.process._process.pid };
    return { sessionId }
}

/**
 *  把房间的音视频流转化成直播地址
 */
module.exports.liveStreamStop = (sessionId) => {
    const pid = global.processObj[sessionId].pid
    kill(pid);
    return { sessionId, pid };
}