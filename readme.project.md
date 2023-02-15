# Installation
1. cnpm i
可能需要会卡在某些包无法下载, 可以把预先下载好的包复制到指定文件夹中（ postinstall 时多次尝试复制）

```bash
$ rm -r ./node_modules/mediasoup/worker/subprojects/packagecache/*
$ cp ./packagecache/* ./node_modules/mediasoup/worker/subprojects/packagecache
$ npm rebuild
```

# Run
### server
```bash
$ git checkout alpha
$ cd server
$ npm start
```
### client
```bash
$ git checkout alpha
$ cd app
$ npm start
```


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
```bash
$ cd /opt/program/nginx/sbin
$ sudo ./nginx -c /opt/program/nginx/conf/nginx.conf
````
3. now rtmp server start at  rtmp://121.5.133.154:1935/myapp/12345


# Issues in development
1. npm run start
```bash
Error: The module '/opt/application/tx-rtcStream/server/node_modules/.pnpm/heapdump@0.3.15/build/Release/addon.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 108. This version of Node.js requires
NODE_MODULE_VERSION 93. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
```




# Bugs
1. 第三方服务可能停止，需要做处理， 比如调用 ASR 服务（60102）
2. 及时停止 asr 服务
3. 推送数字人后，刷新房间，数字人没有了
4. 蒙版头像去背景没有作用
5. ffmpeg 中 scale 的动态参数（n,t,pos）无法使用
6. filter graph 重新初始化时 n , t 等参数会重新开始
7. init_filters() in clan/filter/transcoding.c takes ~200ms, it is intolerable, the time should be reduced to less than 20ms.

# Notices
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
* AsrSDK 的输入是 `audio/x-raw,format=S16LE,channels=1,rate=16000` 的 PCM 格式文件（或者其他