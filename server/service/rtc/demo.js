const { RtcSDK } = require('./rtcSDK');

const rtc = new RtcSDK({});

rtc.socketConnect().then(async () => {

    const ret = await rtc.roomStats();

    console.log(ret);
    rtc.pullAudio('1', ret[0]['members'][0]);

    rtc.on('newAudioData', (data) => {

        console.log(data)
    });
});



