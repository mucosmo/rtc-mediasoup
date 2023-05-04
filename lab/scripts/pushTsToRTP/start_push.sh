#!/usr/bin/bash

# 检测直到 ts 文件存在
while [ ! -e $1 ]
do
    sleep 1
done

# 推送到 rtp
ffmpeg -re -protocol_whitelist file -i $1 -an -c:v vp8 -b:v 1000k  -ssrc 2222 -payload_type 101 -f rtp  rtp://121.5.133.154:$2
