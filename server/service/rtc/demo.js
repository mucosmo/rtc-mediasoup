const { RtcSDK } = require('./rtcSDK');

const rtc = new RtcSDK({});

const fs = require('fs');


// // 拉取音频 asr
// rtc.socketConnect().then(async () => {
//     const ret = await rtc.roomStats();
//     let roomId = 'mixer';
//     let peerId = 'browser_1234';

//     rtc.pullAudio(roomId, peerId);
//     rtc.on('newAudioData', (data) => {
//         console.log(roomId, peerId)
//     });

//     setTimeout(() => {
//         rtc.socketClose();
//     }, 10000);

// });


// // 推送音视频
setTimeout(async () => {
    // 创建房间
    await rtc.createRoom({ roomId: 'mixer', userId: '4' });

    // 加入房间
    await rtc.joinRoom();

    // 推送视频
    await rtc.pushStream('/opt/dev/rtcSdk/files/resources/40_input.mp4');

    // 推送音频（base64)
    const audio = fs.readFileSync('/opt/dev/rtcSdk/server/service/rtc/tts.text', 'utf-8')
    rtc.pushAudio('mixer', '4', audio);

    // 离开房间
    setTimeout(() => {
        rtc.leaveRoom();
    }, 30000);

})










