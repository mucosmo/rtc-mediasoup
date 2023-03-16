const { RtcSDK } = require('./rtcSDK');

const rtc = new RtcSDK({});


let AsrSDK = null;
import('/opt/dev/rtcSdk/server/lib/AsrSdk/AsrUtil.js').then(async mod => {
    AsrSDK = mod.default;
})

module.exports.open = async (param) => {
    asrUtil = new AsrSDK(param);
    await asrUtil.open("TX_5G_ASR_TEST_");
    global.asrUtil = asrUtil;

}

asrUtil = new AsrSDK(param);
await asrUtil.open("TX_5G_ASR_TEST_");

rtc.socketConnect().then(async () => {

    const ret = await rtc.roomStats();

    console.log(ret);
    rtc.pullAudio('1', ret[0]['members'][0]);

    rtc.on('newAudioData', (data) => {

        console.log(data)
    });
});



