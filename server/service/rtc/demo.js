const { RtcSDK } = require('./rtcSDK');

const rtc = new RtcSDK({});

const fs = require('fs');

rtc.socketConnect().then(async () => {


    // rtc.pullAudio('1', ret[0]['members'][0]);

    // rtc.on('newAudioData', (data) => {

    //     console.log(data)
    // });

    // const audio = fs.readFileSync('/opt/dev/rtcSdk/server/service/rtc/tts.text', 'utf-8');
    // rtc.pushAuido(rtc.roomId, rtc.peerId, audio);

    await rtc.createRoom({roomId: '21', userId: '4'});
    await rtc.joinRoom();
    rtc.pushStream('/opt/dev/rtcSdk/files/resources/40_input.mp4');

    setTimeout(() => {
        rtc.leaveRoom();
    }, 15000);

});



