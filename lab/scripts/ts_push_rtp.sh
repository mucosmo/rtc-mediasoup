#!/usr/bin/env bash

# ## 生成 ts 文件
# ffmpeg -re -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -c copy -bsf:v h264_mp4toannexb -y -f mpegts /opt/application/tx-rtcStream/files/synthesis/output.ts
# ## 推送 ts 文件到 rtp
# ffmpeg -re -protocol_whitelist file -i /opt/application/tx-rtcStream/files/synthesis/output.ts  -c:v vp8 -b:v 1000k  -ssrc 2222 -payload_type 101 -f rtp  rtp://121.5.133.154:10064


while [ ! -e /opt/application/tx-rtcStream/files/synthesis/output.ts ]
do
    sleep 1
done


ffmpeg -protocol_whitelist file -i /opt/application/tx-rtcStream/files/synthesis/output.ts -an -c:v vp8 -b:v 1000k  -ssrc 2222 -payload_type 101 -f rtp  rtp://121.5.133.154:10088
