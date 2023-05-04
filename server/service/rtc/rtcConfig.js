require('dotenv').config();

module.exports = {
    RTC_SERVER_HTTPS_BASEURL: process.env.RTC_SERVER_HTTPS_BASEURL || 'https://chaosyhy.com:4443',
    RTC_SERVER_WSS_BASEURL: process.env.RTC_SERVER_WSS_BASEURL || 'wss://chaosyhy.com:4443',
    RTC_AUDIO_WSS_BASEURL: process.env.RTC_AUDIO_WSS_BASEURL || 'ws://chaosyhy.com:60154',
}