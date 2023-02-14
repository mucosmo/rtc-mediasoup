### 安装
1. cnpm i
可能需要会卡在某些包无法下载, 可以把预先下载好的包复制到指定文件夹中（ postinstall 时多次尝试复制）

```bash
$ rm -r ./node_modules/mediasoup/worker/subprojects/packagecache/*
$ cp ./packagecache/* ./node_modules/mediasoup/worker/subprojects/packagecache
$ npm rebuild
```

### 运行
#### server
```bash
$ cd server
$ git checkout alpha
$ npm run start
```

#### 视频合成 C 语言实现

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
#### mediasoup server
```bash
cd server/
npm run start
````
## Issues in development

1. npm run start

```bash
Error: The module '/opt/application/tx-rtcStream/server/node_modules/.pnpm/heapdump@0.3.15/build/Release/addon.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 108. This version of Node.js requires
NODE_MODULE_VERSION 93. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
   ```

### 注意

1. 更改了如下文件 
* ```aiortc/node_modules/mediasoup-client-aiortc/lib/FakeRTCDataChannel.js``` 中的 

```js
this._readyState = 'open'; // 原值为 status.readyState
```

2. AsrSDK 的输入是 ```audio/x-raw,format=S16LE,channels=1,rate=16000``` 的 PCM 格式文件（或者其他）

### 任务

1. 音视频流连接，推出去
2. 音视频流接入房间
3. 多个 session 测试 ASR 的并发能力
4. 流合成
5. ipass_oauth  ipass_config (json schema)
6. ffmpeg 合成时，文件的 loop, 文件有效性的检测，播放的中断（显示静止帧）
7. 3D 模型旋转 (transpose?)

### bug

1. 第三方服务可能停止，需要做处理， 比如调用 ASR 服务（60102）
2. 及时停止 asr 服务
3. 推送数字人后，刷新房间，数字人没有了
4. 蒙版头像去背景没有作用
5. ffmpeg 中 scale 的动态参数（n,t,pos）无法使用

## notice

1. m3u8, hls 格式进行推流服务提供给用户
2. 当前由 gst 发起的进程没有及时 kill

```shell
ps -ef | grep gst-launch | awk '{ print $2 }' | xargs kill -9
```

3. ffmpeg filter 中参数名称可省略，此时需按照默认顺序填写
4. filter graph 重新初始化时 n , t 等参数会重新开始
