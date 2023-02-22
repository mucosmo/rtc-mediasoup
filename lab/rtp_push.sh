#!/usr/bin/env bash

ffmpeg -protocol_whitelist tcp,rtmp,udp -i rtmp://liveplay.ivh.qq.com/live/m688346523238401  -filter_complex '[0:v]boxblur=3:1,drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=20[v0]' -map [v0] -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp rtp://121.5.133.154:10024
ffmpeg -re -protocol_whitelist file -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -filter_complex '[0:v]boxblur=3:1[v0]' -map [v0] -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp  rtp://121.5.133.154:10003

ffmpeg -re -protocol_whitelist file -i /opt/application/tx-rtcStream/server/clan/filter/40_input.mp4 -map 0:v -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp -packet_size 1400 -flush_packets 1 rtp://121.5.133.154:10044
ffmpeg -re -fflags +genpts -protocol_whitelist file -i /opt/application/tx-rtcStream/server/clan/filter/40_input.mp4 -map 0:v -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp -packet_size 1400 -flush_packets 1 rtp://121.5.133.154:10013

ffmpeg -i input.mp4 -filter_complex "scale=640:360,drawtext=text='Filter 1':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2 [filter1];[0:v]hue=s=0[filter2]" -map "[filter1]" -f rtp rtp://127.0.0.1:5004 -map "[filter2]" -f v4l2 /dev/video0 -send_event filter_change="filter1"=expr='gte(t,10)' 

ffmpeg -re -i /opt/application/tx-rtcStream/server/clan/filter/40_input.mp4 -filter_complex_script filters.txt output.mp4


ffmpeg -re -protocol_whitelist file -i input.mp4 -map 0:v -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp  rtp://121.5.133.154:10049


ffmpeg -re -protocol_whitelist file -i input.mp4 -map 0:v -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 4 -ssrc 2222 -payload_type 101 -f rtp -packet_size 1400 -flush_packets 1 rtp://121.5.133.154:10044


ffmpeg -v verbose -re -y -i office30s.mp4 -i 40_input.mp4 \
-filter_complex "[1]scale=iw/2:ih/2 [pip]; [pip] zmq,[0]overlay=x=0:y=0" \
-f mpegts -codec:v libx264 -preset ultrafast result.mp4

## 读取 pcm 文件，写入 fifo , 再读取 fifo 写入 wav 文件
ffmpeg -re -f s16le -ac 1 -ar 16000 -i /opt/application/tx-rtcStream/files/16k-2.pcm -f s16le - > ffmpeg.fifo
ffmpeg -re -f s16le -ac 1 -ar 16000 -i ffmpeg.fifo -y 16k-1-pcm.wav

ffmpeg -i /opt/application/tx-rtcStream/files/resources/20_input.mp4 -f mpegts -codec:v mpeg1video -s 640x480 -b:v 800k -bf 0 -muxdelay 0 -fifo ffmpeg.fifo