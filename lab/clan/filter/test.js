var ffi = require('ffi-napi');

const fs = require('fs');
var filter = ffi.Library('./filtering_video', {
    'avfilter': ['int', ['string', 'string', 'string']],
    "pushStream": ['int', ['string', 'string']],

});

const dhVideo = '/opt/application/tx-rtcStream/files/resources/dh.mp4'
const offiveVideo = '/opt/application/tx-rtcStream/files/resources/filevideo.mp4';
const input = '/opt/application/tx-rtcStream/server/clan/input.txt';
const output = '/opt/application/tx-rtcStream/server/clan/output.txt';
const me_20s = '/opt/application/tx-rtcStream/files/resources/me_voice_20s.mp4';

const rtmp = 'rtmp://121.5.133.154:1935/myapp/12345';

// filter.avfilter(offiveVideo, input, rtmp);
filter.pushStream(me_20s, rtmp);