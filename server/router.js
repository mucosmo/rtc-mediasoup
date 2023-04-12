/**
 * Create an Express based API server to manage Broadcaster requests.
 */

const express = require('express');
const bodyParser = require('body-parser');

const Logger = require('./lib/Logger');
const logger = new Logger();

const { startSync, startAsync } = require('./lib/stream_pipeline/asr');
const { liveStreamUrl, liveStreamStop, streamComposite } = require('./lib/stream_pipeline/pull');

const { NodePeer } = require('./lib/stream_pipeline/push');
const { StreamSession } = require('./service/session');
const { FfmpegCommand } = require('./service/ffmpeg');
const fs = require('fs');

const { RtcSDK } = require('./service/rtc/rtcSDK');

const rtc = new RtcSDK({});

setTimeout(() => {
    rtc.socketConnect();
}, 2000);


const { RtcServer } = require('./service/rtcServer');

const rtcServer = new RtcServer({});



async function createExpressApp() {
    logger.info('creating Express app...');

    const expressApp = express();

    expressApp.use(express.json({ limit: '5mb' }));
    expressApp.use(express.urlencoded({ limit: '5mb' }));

    /**
     * For every API request, verify that the roomId in the path matches and
     * existing room.
     * 
     * The expressApp.param() method is a special kind of middleware that is executed for 
     * a specific parameter in the path of an incoming request. 
     */
    expressApp.param(
        'roomId', (req, res, next, roomId) => {

            // The room must exist for all API requests.
            if (!rooms.has(roomId)) {
                const error = new Error(`room with id "${roomId}" not found`);

                error.status = 404;
                throw error;
            }

            req.room = rooms.get(roomId);

            next();
        });

    /**
     * API GET resource that returns the mediasoup Router RTP capabilities of
     * the room.
     */
    expressApp.get(
        '/rooms/:roomId', (req, res) => {
            const data = req.room.getRouterRtpCapabilities();

            res.status(200).json(data);
        });

    /**
     * POST API to create a Broadcaster.
     */
    expressApp.post(
        '/rooms/:roomId/broadcasters', async (req, res, next) => {
            const {
                id,
                displayName,
                device,
                roomId,
            } = req.body;
            const rtpCapabilities = req.room.getRouterRtpCapabilities();
            try {
                const data = await req.room.createBroadcaster(
                    {
                        id,
                        roomId,
                        displayName,
                        device,
                        rtpCapabilities
                    });
                res.status(200).json(data);
            }
            catch (error) {
                next(error);
            }
        });

    /**
     * DELETE API to delete a Broadcaster.
     */
    expressApp.delete(
        '/rooms/:roomId/broadcasters/:broadcasterId', (req, res) => {
            const { broadcasterId } = req.params;

            req.room.deleteBroadcaster({ broadcasterId });

            res.status(200).send('broadcaster deleted');
        });

    /**
     * POST API to create a mediasoup Transport associated to a Broadcaster.
     * It can be a PlainTransport or a WebRtcTransport depending on the
     * type parameters in the body. There are also additional parameters for
     * PlainTransport.
     */
    expressApp.post(
        '/rooms/:roomId/broadcasters/:broadcasterId/transports',
        async (req, res, next) => {
            const { broadcasterId } = req.params;
            const { type, rtcpMux, comedia, sctpCapabilities } = req.body;

            try {
                const data = await req.room.createBroadcasterTransport(
                    {
                        broadcasterId,
                        type,
                        rtcpMux,
                        comedia,
                        sctpCapabilities
                    });

                res.status(200).json(data);
            }
            catch (error) {
                next(error);
            }
        });

    /**
     * POST API to connect a Transport belonging to a Broadcaster. Not needed
     * for PlainTransport if it was created with comedia option set to true.
     */
    expressApp.post(
        '/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/connect',
        async (req, res, next) => {
            const { broadcasterId, transportId } = req.params;
            const { dtlsParameters } = req.body;

            try {
                const data = await req.room.connectBroadcasterTransport(
                    {
                        broadcasterId,
                        transportId,
                        dtlsParameters
                    });

                res.status(200).json(data);
            }
            catch (error) {
                next(error);
            }
        });

    /**
     * POST API to create a mediasoup Producer associated to a Broadcaster.
     * The exact Transport in which the Producer must be created is signaled in
     * the URL path. Body parameters include kind and rtpParameters of the
     * Producer.
     */
    expressApp.post(
        '/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/producers',
        async (req, res, next) => {
            const { broadcasterId, transportId } = req.params;
            const { kind, rtpParameters, target } = req.body;

            try {
                const data = await req.room.createBroadcasterProducer(
                    {
                        broadcasterId,
                        transportId,
                        kind,
                        rtpParameters,
                        target
                    });

                res.status(200).json(data);
            }
            catch (error) {
                next(error);
            }
        });

    /**
     * POST API to create a mediasoup Consumer associated to a Broadcaster.
     * The exact Transport in which the Consumer must be created is signaled in
     * the URL path. Query parameters must include the desired producerId to
     * consume.
     */
    expressApp.post(
        '/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/consume',
        async (req, res, next) => {
            const { broadcasterId, transportId } = req.params;
            const { producerId } = req.query;

            try {
                const data = await req.room.createBroadcasterConsumer(
                    {
                        broadcasterId,
                        transportId,
                        producerId
                    });

                res.status(200).json(data);
            }
            catch (error) {
                next(error);
            }
        });

    /**
     * POST API to create a mediasoup DataConsumer associated to a Broadcaster.
     * The exact Transport in which the DataConsumer must be created is signaled in
     * the URL path. Query body must include the desired producerId to
     * consume.
     */
    expressApp.post(
        '/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/consume/data',
        async (req, res, next) => {
            const { broadcasterId, transportId } = req.params;
            const { dataProducerId } = req.body;

            try {
                const data = await req.room.createBroadcasterDataConsumer(
                    {
                        broadcasterId,
                        transportId,
                        dataProducerId
                    });

                res.status(200).json(data);
            }
            catch (error) {
                next(error);
            }
        });

    /**
     * POST API to create a mediasoup DataProducer associated to a Broadcaster.
     * The exact Transport in which the DataProducer must be created is signaled in
     */
    expressApp.post(
        '/rooms/:roomId/broadcasters/:broadcasterId/transports/:transportId/produce/data',
        async (req, res, next) => {
            const { broadcasterId, transportId } = req.params;
            const { label, protocol, sctpStreamParameters, appData } = req.body;

            try {
                const data = await req.room.createBroadcasterDataProducer(
                    {
                        broadcasterId,
                        transportId,
                        label,
                        protocol,
                        sctpStreamParameters,
                        appData
                    });

                res.status(200).json(data);
            }
            catch (error) {
                next(error);
            }
        });


    /**
    * 从房间拉取音频流并外送进行 ASR
    */
    expressApp.post(
        '/stream/pull/dm',
        async (req, res, next) => {
            try {
                if (req.body.mode === 'sync') { //同步模式
                    const rooms = Object.keys(global.streamInfo)
                    const peers = []
                    for (let room of rooms) {
                        const peersInRoom = Object.keys(global.streamInfo[room])
                        peers.push(peersInRoom)
                    }
                    const data = req.body.stream.mediasoup;
                    let roomIdNum = Number(data.room.slice(-1)) // 前段传递的伪数据
                    let userIdNum = Number(data.user.slice(-1))
                    const roomId = rooms[roomIdNum - 1]
                    const peerId = peers[roomIdNum - 1][userIdNum - 1]

                    const param = {
                        model: "async",
                        callback: {
                            onComplete: ""
                        },
                        config: req.body.config.config // 此处可能需要修改，不能暴露 token 
                    }

                    await startSync(roomId, peerId, param);
                    res.status(200).json({ mode: "sync", room: roomId, user: global.streamInfo[roomId][peerId]["name"] });

                } else if (req.body.mode === 'async') { //异步模式

                    const format = req.body.stream.file.format;
                    let file = req.body.stream.file.name;
                    file = `16k-${file.slice(-1)}.${format}`

                    const data = req.body.stream.file;
                    data.name = file;

                    const param = {
                        model: "async",
                        callback: {
                            onComplete: ""
                        },
                        config: req.body.config.config
                    }
                    await startAsync(file, param);
                    res.status(200).json({ mode: "async", format: format, file: file });

                }
            }
            catch (error) {
                console.log(error)
                next(error);
            }
        });

    /**
    * 从房间会话中生成直播流地址
    */
    expressApp.post(
        '/stream/pull/live',
        async (req, res, next) => {
            try {
                const rooms = Object.keys(global.streamInfo)
                const peers = []
                for (let room of rooms) {
                    const peersInRoom = Object.keys(global.streamInfo[room])
                    peers.push(peersInRoom)
                }
                const data = req.body;
                let roomIdNum = Number(data.room.slice(-1)) // 前段传递的伪数据
                let userIdNum = Number(data.user.slice(-1))
                const roomId = rooms[roomIdNum - 1]
                const peerId = peers[roomIdNum - 1][userIdNum - 1]

                const { sessionId, liveUrl } = liveStreamUrl(roomId, peerId);

                res.status(200).json({ room: roomId, user: global.streamInfo[roomId][peerId]["name"], liveUrl, sessionId });
            }
            catch (error) {
                console.log(error)
                next(error);
            }
        });


    /**
     * 从房间拉流并进行相应操作（dm/rec/live/mux/transcript)
     */
    expressApp.post(
        '/stream/pull',
        async (req, res, next) => {
            try {
                const rooms = Object.keys(global.streamInfo)
                const peers = []
                for (let room of rooms) {
                    const peersInRoom = Object.keys(global.streamInfo[room])
                    peers.push(peersInRoom)
                }
                const data = req.body;
                let roomIdNum = Number(data.room.slice(-1)) // 前段传递的伪数据
                let userIdNum = Number(data.user.slice(-1))
                const roomId = rooms[roomIdNum - 1]
                const peerId = peers[roomIdNum - 1][userIdNum - 1]
                const { sessionId } = streamComposite(roomId, peerId);

                res.status(200).json({ sessionId });
            }
            catch (error) {
                console.log(error)
                next(error);
            }
        });


    /**
    * 从房间拉流并进行相应操作（dm/rec/live/mux/transcript)
    */
    expressApp.post(
        '/stream/render',
        async (req, res, next) => {
            try {
                const input = '/opt/application/tx-rtcStream/lab/clan/filter/input.txt';
                fs.writeFileSync(input, req.body.text, 'utf8');
                res.status(200).json({ text: req.body.text });
            }
            catch (error) {
                next(error);
            }
        });


    /**
    * 将外部流（数字人）推送到房间
    */
    expressApp.post(
        '/stream/push',
        async (req, res, next) => {
            let nodepeer = null;
            try {
                const data = req.body;
                const nodepeer = new NodePeer(data);
                await nodepeer.createRoom();
                await nodepeer.joinRoom();
                await nodepeer.startPush();
                res.status(200).json(nodepeer);
            }
            catch (error) {
                await nodepeer.close();
                next(error);
            }
        });

    /**
    * open the transport channel for stream push
    */
    expressApp.post(
        '/stream/push/open',
        async (req, res, next) => {
            let rtc = null;
            try {
                const data = req.body;
                const ret = await rtcServer.produce(data);
                res.status(200).json(ret);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });


    /**
    * end session
    * 
    * the session maybe creted by stream push or live stream etc.
    */
    expressApp.delete(
        '/stream/session/end',
        async (req, res, next) => {
            const { sessionId } = req.body;

            const streamSession = new StreamSession({ sessionId });
            const result = await streamSession.close()
            res.status(200).json(result);
        });

    /**
    * end all external sessions
    * 
    * the session maybe creted by stream push or live stream etc.
    */
    expressApp.delete(
        '/stream/session/end/all',
        async (req, res, next) => {
            const keys = Object.keys(global.processObj);
            keys.forEach(async (key) => {
                const streamSession = new StreamSession({ sessionId: key });
                await streamSession.close();
            })
            res.status(200).json(keys);
        });
    expressApp.post(
        '/rtc/room/create',
        async (req, res, next) => {
            try {
                const data = req.body;
                const rtc = new RtcSDK({});
                await rtc.createRoom(data);
                res.status(200).json(rtc);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/room/produce',
        async (req, res, next) => {
            try {
                const data = req.body;
                const ret = await rtcServer.produce(data);
                res.status(200).json(ret);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/room/push',
        async (req, res, next) => {
            try {
                const data = req.body;
                const ret = await rtcServer.pushStream(data);
                res.status(200).json(ret);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/room/push/tts',
        async (req, res, next) => {
            try {
                const data = req.body;
                const ret = await rtcServer.pushTTS(data);
                res.status(200).json(ret);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/room/audio/push',
        async (req, res, next) => {
            try {
                const data = req.body;
                const ret = await rtcServer.pushAudio(data);
                res.status(200).json(ret);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });


    expressApp.post(
        '/rtc/room/command',
        async (req, res, next) => {
            try {
                const data = req.body;
                const ret = await rtcServer.execCommand(data);
                res.status(200).json(ret);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/room/leave',
        async (req, res, next) => {
            try {
                const data = req.body;
                data.userId = 'node_' + data.userId;
                RtcSDK.nodeLeave(data);
                res.status(200).json(rtc);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/stream/pull',
        async (req, res, next) => {
            try {
                const data = req.body;
                const rtc = new RtcSDK(data);
                const audio = await rtc.pullAudio(data.roomId, data.userId);
                res.status(200).json(audio);
            }
            catch (error) {
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/room/stats',
        async (req, res, next) => {
            try {
                const data = req.body;
                const rtc = new RtcSDK(data);
                const stats = await rtc.roomStats();
                res.status(200).json(stats);
            }
            catch (error) {
                console.log('===/rtc/room/stats==')
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/room/push/dh',
        async (req, res, next) => {
            try {
                const data = req.body;
                await rtc.createRoom(data);
                const rtp = await rtc.joinRoom();
                rtc.pushDh(data.url);
                res.status(200).json(rtp);
            }
            catch (error) {
                console.log('===/rtc/room/stats==')
                console.error(error)
                next(error);
            }
        });

    expressApp.post(
        '/rtc/room/push/audio',
        async (req, res, next) => {
            try {
                const data = req.body;
                rtc.pushAudio(data.roomId, data.peerId, data.audio);
                res.status(200).json(data);
            }
            catch (error) {
                console.log('===/rtc/room/stats==')
                console.error(error)
                next(error);
            }
        });





    /**
* open the transport channel for stream push
*/
    expressApp.post(
        '/rooms/stats',
        async (req, res, next) => {
            const rtc = []
            try {
                for (const theRoom of global.rooms.values()) {
                    const roomId = theRoom._roomId;
                    const room = rtc.find(r => r.room === roomId);
                    const members = theRoom._protooRoom.peers.map(peer => peer._id);
                    if (!room) {
                        rtc.push({
                            room: roomId,
                            members
                        })
                    } else {
                        room.members.push(...members);
                        rtc.push(room)
                    }
                }
                res.status(200).json(rtc);
            }
            catch (error) {
                next(error);
            }
        });


    /**
     * Error handler.
     */
    expressApp.use(
        (error, req, res, next) => {
            if (error) {
                logger.warn('Express app %s', String(error));
                error.status = error.status || (error.name === 'TypeError' ? 400 : 500);
                res.statusMessage = error.message;
                res.status(error.status).send(String(error));
            }
            else {
                next();
            }
        });

    return expressApp;
}

module.exports = createExpressApp;