const { RtcSDK } = require('./rtcSDK');

const rtc = new RtcSDK({});

const fs = require('fs');


rtc.roomStats().then(ret => {
    let roomId = '1';
    let peerId = ret[0]['members'][0];

    rtc.socketConnect(roomId, peerId).then(async () => {
        rtc.pullAudio(roomId, peerId);
        rtc.on('newAudioData', (data) => {
            console.log(roomId, peerId)
        });


        // // 推视频流
        // await rtc.createRoom({roomId: '21', userId: '4'});
        // await rtc.joinRoom();
        // rtc.pushStream('/opt/dev/rtcSdk/files/resources/40_input.mp4');
        // setTimeout(() => {
        //     rtc.leaveRoom();
        // }, 15000);


        setTimeout(() => {
            rtc.socketClose();
        }, 10000);

    });
});





