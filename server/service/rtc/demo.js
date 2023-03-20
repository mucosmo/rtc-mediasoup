const { RtcSDK } = require('./rtcSDK');

const rtc = new RtcSDK({});

const fs = require('fs');

rtc.socketConnect().then(async () => {


    // 拉音频流
    const ret = await rtc.roomStats();
    rtc.pullAudio('1', ret[0]['members'][0]);
    rtc.on('newAudioData', (data) => {
        console.log(data)
    });


    // // 推视频流
    // await rtc.createRoom({roomId: '21', userId: '4'});
    // await rtc.joinRoom();
    // rtc.pushStream('/opt/dev/rtcSdk/files/resources/40_input.mp4');
    // setTimeout(() => {
    //     rtc.leaveRoom();
    // }, 15000);

});



