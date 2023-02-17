#!/usr/bin/bash
rm -rf /opt/application/tx-rtcStream/server/clan/filter/send_by_rtp.o

make
gcc -fPIC -shared -rdynamic  /opt/application/tx-rtcStream/server/clan/filter/send_by_rtp.o -L/opt/program/ffmpeg/lib -lavcodec -lavformat -lavfilter -lavutil -lavdevice -o /opt/application/tx-rtcStream/server/clan/filter/send_by_rtp.so

