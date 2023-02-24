echo "start to make..."

video1=/opt/application/tx-rtcStream/lab/clan/filter/filtering_video.o
video2=/opt/application/tx-rtcStream/lab/clan/filter/transcoding.o
if [ -f $video1 ]; then
  rm -rf $video1
fi

if [ -f $video2 ]; then
  rm -rf $video2
fi

cp /opt/application/tx-rtcStream/lab/clan/filter/input_bak.txt /opt/application/tx-rtcStream/lab/clan/filter/input.txt

make

sleep 5

gcc -fPIC -shared -rdynamic  /opt/application/tx-rtcStream/lab/clan/filter/filtering_video.o -L/opt/program/ffmpeg/lib -lavcodec -lavformat -lavfilter -lavutil -lavdevice -o /opt/application/tx-rtcStream/lab/clan/filter/filtering_video.so
gcc -fPIC -shared -rdynamic  /opt/application/tx-rtcStream/lab/clan/filter/transcoding.o -L/opt/program/ffmpeg/lib -lavcodec -lavformat -lavfilter -lavutil -lavdevice -o /opt/application/tx-rtcStream/lab/clan/filter/transcoding.so


echo "transcoding..."
timestamp=$(date +%s)
outputvideo=/opt/application/tx-rtcStream/files/synthesis/output.ts

# RTMP 生成文件
./transcoding rtmp://liveplay.ivh.qq.com/live/$1 ${outputvideo}

end_time=$(date +%s)

echo c-execution time was `expr $end_time - $timestamp` s

