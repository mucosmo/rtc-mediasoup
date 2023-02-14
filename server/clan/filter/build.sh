rm -rf /opt/application/tx-rtcStream/server/clan/filter/filtering_video.o /opt/application/tx-rtcStream/server/clan/filter/transcoding.o
cp /opt/application/tx-rtcStream/server/clan/filter/input_bak.txt /opt/application/tx-rtcStream/server/clan/filter/input.txt

make
gcc -fPIC -shared -rdynamic  /opt/application/tx-rtcStream/server/clan/filter/filtering_video.o -L/opt/program/ffmpeg/lib -lavcodec -lavformat -lavfilter -lavutil -lavdevice -o /opt/application/tx-rtcStream/server/clan/filter/filtering_video.so

gcc -fPIC -shared -rdynamic  /opt/application/tx-rtcStream/server/clan/filter/transcoding.o -L/opt/program/ffmpeg/lib -lavcodec -lavformat -lavfilter -lavutil -lavdevice -o /opt/application/tx-rtcStream/server/clan/filter/transcoding.so