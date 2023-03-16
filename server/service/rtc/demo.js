const { RtcSDK } = require('./rtcSDK');

const rtc = new RtcSDK({ roomId: 1 });

const fs = require('fs');

rtc.socketConnect().then(async () => {


    // rtc.pullAudio('1', ret[0]['members'][0]);

    // rtc.on('newAudioData', (data) => {

    //     console.log(data)
    // });

    const audio = fs.readFileSync('/opt/dev/rtcSdk/server/service/rtc/tts.text', 'utf-8');
    rtc.pushAuido(rtc.roomId, rtc.peerId, audio);


    await rtc.createRoom();
    await rtc.joinRoom();
    rtc.pushDh('/opt/dev/rtcSdk/files/resources/forest.mp4');





});



