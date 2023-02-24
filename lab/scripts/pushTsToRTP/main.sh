#!/usr/bin/bash
rm -rf /opt/application/tx-rtcStream/files/synthesis/output.ts

cd /opt/application/tx-rtcStream/lab/clan/filter
./build.sh rtmp://liveplay.ivh.qq.com/live/m1022328599216129 &

