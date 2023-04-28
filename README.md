# TX-RTCStream

## Installation

1. server

```bash
$ cd server
$ git checkout alpha
$ npm install
```

可能在 post install script 阶段卡在某些包无法下载, 可以把预先下载好的包复制到指定文件夹中（ postinstall 时多次尝试复制）

```bash
rm -r ./node_modules/mediasoup/worker/subprojects/packagecache/*
$ cp ./packagecache/* ./node_modules/mediasoup/worker/subprojects/packagecache
$ npm rebuild
```

2. app

```bash
$ cd app
$ git checkout alpha
$ npm install
```

可能报错：
>Invalid tag name ">=^16.0.0": Tags may not have any characters that encodeURIComponent encodes. package: mediasoup-demo-app@3.0.0 › react-tooltip@^3.11.1 › react

解决方法：

```bash
$ npm config set registry https://registry.npmmirror.com
$ npm i --legacy-peer-deps
```

## Run

### server

```bash
git checkout alpha
cd server
npm start
```

### client

```bash
git checkout alpha
cd app
npm start
```

then open the browser and visit `chrome://webrtc-internals/` to see the webrtc status

### video synthesis in C language

```bash
# get into the dir
$ cd server/clan/filter
# filter parameters
$ cp input_bak.txt input.txt
# build the C source code
$ ./build.sh
# video composite
$ ./shtranscoding.sh 
```

### push stream rtmp server

1. install software  [VLC media player](https://www.videolan.org/vlc/)  and [mediainfo](https://mediaarea.net/en/MediaInfo)
2. start rtmp server: start nginx with nginx-rtmp-module-master
3. now rtmp server start at  rtmp://121.5.133.154:1935/myapp/12345

```bash
cd /opt/program/nginx/sbin
sudo ./nginx -c /opt/program/nginx/conf/nginx.conf
```

### push/pull stream with rtc room

1. the control server repository is [here](https://github.com/mucosmo/tx-rtcStream)

## Bugs

1. 第三方服务可能停止，需要做处理， 比如调用 ASR 服务（60102）
2. 及时停止 asr 服务
3. 推送数字人后，刷新房间，数字人没有了
4. 蒙版头像去背景没有作用
5. ffmpeg 中 scale 的动态参数（n,t,pos）无法使用
6. filter graph 重新初始化时 n , t 等参数会重新开始
7. init_filters() in clan/filter/transcoding.c takes ~200ms, it is intolerable, the time should be reduced to less than 20ms.

## Tips

1. free memory when necessary: `sudo sh -c "echo 3 > /proc/sys/vm/drop_caches"`;
2. kill all process started by gst-launch: `ps -ef | grep gst-launch | awk '{ print $2 }' | xargs kill -9`

## Notices

* 更改了如下文件 `aiortc/node_modules/mediasoup-client-aiortc/lib/FakeRTCDataChannel.js` 中的

```js
this._readyState = 'open'; // 原值为 status.readyState
```

* m3u8, hls 格式进行推流服务提供给用户
* 当前由 gst 发起的进程没有及时 kill

```shell
ps -ef | grep gst-launch | awk '{ print $2 }' | xargs kill -9
```

* ffmpeg filter 中参数名称可省略，此时需按照默认顺序填写
* AsrSDK 的输入是 `audio/x-raw,format=S16LE,channels=1,rate=16000` 的 PCM 格式文件（或者其他）

* generate a rtp strema and replay it

```bash
# generate mp4 file
$ ffmpeg -f lavfi -i testsrc=duration=60:size=320x240:rate=30 -pix_fmt yuv420p -c:v libx264 -preset ultrafast -tune zerolatency 60_input.mp4
$ ffmpeg -re -i 40_input.mp4 -c:v libx264 -preset medium -b:v 1000k -maxrate 1500k -bufsize 2000k -c:a aac -b:a
 128k -ac 2 -f rtp rtp://127.0.0.1:5004 -sdp_file 40_input.sdp 
$ ffplay -protocol_whitelist rtp,udp,file -i 40_input.sdp
```

* send to rtc room over rtp

```bash
$ ffmpeg -protocol_whitelist tcp,rtmp,udp -i rtmp://liveplay.ivh.qq.com/live/m529869779763201 -map 0:v -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp rtp://121.5.133.154:10037
$ ffmpeg -protocol_whitelist tcp,rtmp,udp -i rtmp://liveplay.ivh.qq.com/live/m577640251523073  -filter_complex '[0:v]boxblur=10:1[v0]' -map [v0] -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp rtp://121.5.133.154:10041
```

## Issues in development

1. npm run start

```bash
Error: The module '/opt/application/tx-rtcStream/server/node_modules/.pnpm/heapdump@0.3.15/build/Release/addon.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 108. This version of Node.js requires
NODE_MODULE_VERSION 93. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
```

2. app -> npm start failed 

## Logs

* 2023-2-15: both app and server are ok
