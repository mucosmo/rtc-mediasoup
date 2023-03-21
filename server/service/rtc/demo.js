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
    await rtc.joinRoom({ roomId: 'mixer' });

    // // 推送音视频
    // await rtc.pushStream({ video: '/opt/dev/rtcSdk/files/resources/filevideo.mp4', audio: '/opt/dev/rtcSdk/files/resources/彩虹.mp3' });
    // await rtc.pushStream({ video: '/opt/dev/rtcSdk/files/resources/filevideo.mp4' });
    // await rtc.pushStream({ audio: '/opt/dev/rtcSdk/files/resources/彩虹.mp3' });

    // 推送音频（base64)
    const audio = fs.readFileSync('/opt/dev/rtcSdk/server/service/rtc/tts.text', 'utf-8')
    const ret = await rtc.pushTTS({ roomId: 'mixer', audio });
    console.log(ret)

    // 离开房间
    setTimeout(() => {
        rtc.leaveRoom();
    }, 60000);

})










