const { RtcSDK } = require('./rtcSDK');

const rtc = new RtcSDK({});

// // 拉取音频 asr
// rtc.socketConnect().then(async () => {
//     // const ret = await rtc.roomStats();
//     let roomId = '1';
//     let peerId = 'browser_000119154nzzjd3bs3h';

//     rtc.pullAudio(roomId, peerId);
//     rtc.on('newAudioData', (data) => {
//         console.log(data)
//     });

//     // setTimeout(() => {
//     //     rtc.socketClose();
//     // }, 10000);

// });

// // 正在讲话的用户
// rtc.socketConnect().then(async () => {
//     rtc.activeSpeaker();
//     rtc.on('activeSpeaker', (data) => {
//         console.log(data)
//     });
// });

// // 房间动态
// rtc.socketConnect().then(async () => {
//     rtc.roomStatus();
//     rtc.on('roomStatus', (data) => {
//         console.log(data)
//     });
// });

// // 推送音视频
// setTimeout(async () => {
//     // 创建房间
//     await rtc.joinRoom({
//         roomId: '1',
//         target: {
//             lanListen: ['zh'],
//             role: 'student'
//         }
//     });

//     // // 推送音视频
//     // await rtc.pushStream({ video: '/opt/dev/rtcSdk/files/resources/filevideo.mp4', audio: '/opt/dev/rtcSdk/files/resources/彩虹.mp3' });
//     // await rtc.pushStream({ video: '/opt/dev/rtcSdk/files/resources/filevideo.mp4' });
//     // await rtc.pushStream({ audio: '/opt/dev/rtcSdk/files/resources/彩虹.mp3' });

//     // // 推送音频（base64)
//     const fs = require('fs');
//     const audio = fs.readFileSync('/opt/dev/rtcSdk/server/service/rtc/tts.text', 'utf-8')
//     console.log(rtc.peerId)
//     await rtc.pushTTS(audio);

//     // // 离开房间
//     // setTimeout(() => {
//     //     rtc.leaveRoom();
//     // }, 60000);
// })













