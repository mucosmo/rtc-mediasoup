#!/usr/bin/env bash

timestamp=$(date +%s)

outputvideo=../files/composites/shell-${timestamp}.

# 568*320
video1=../files/resources/filevideo.mp4
# 568*320
office=../files/resources/office.mp4
# 568*320
video2=../files/resources/video2.mp4
# 1401*1261
png=../files/resources/fileimage.png
gif=../files/resources/gif.gif
mask=../files/resources/mask.png
svg=../files/resources/svg.svg
rtmp='rtmp\\://175.178.31.221\\:51013/live/m25822721816395777'
m3u8=http://hz-test.ikandy.cn:60125/files/m3u8/1669358475054g2l5bihp6e/mediasoup_live.m3u8
dh=../files/resources/dh.mp4
subtitles=../files/resources/subtitles.srt
font=/usr/share/fonts/chinese/SIMKAI.TTF
drawtext="你好啊"
drawtextfile=../files/resources/drawtext.txt
screen5s=../files/resources/screen5s.mp4
koreaRtmp=rtmp://mobliestream.c3tv.com:554/live/goodtv.sdp

onlinepic='https\\://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg' // 转义字符，避免 : 出现歧义


# ffmpeg -hide_banner -h filter=transpose

# ffplay -hide_banner -f lavfi -i testsrc -vf transpose=1

# ffmpeg -i resources/filevideo.mp4 -vf "hqdn3d,pad=2*iw" output.mp4

# gif
# ffmpeg -i ${video1} -ignore_loop 0 -i ${gif} -filter_complex "[0:v][1:v]overlay=10:10:shortest=1" output.mp4

# 滤镜图中有空格时，需要用双引号括起来，否则会报错
# ffmpeg -i resources/filevideo.mp4 -lavfi "split[main][tmp];[tmp]crop=iw:ih/2:0:0,vflip[flip];[main][flip]overlay=0:H/2" ${outputvideo}

# 需要 --enable-librsvg
# ffmpeg -i ${svg} test.png

# 字幕向上滚动
# ffplay -hide_banner -f lavfi -i color=size=640x480:duration=10:rate=25:color=green -vf "drawtext=fontfile=/path/to/helvitca.ttf:fontsize=100:fontcolor=FFFFFF:x=(w-text_w)/2:y=h-80*t:text='Hello World'"

# # alphamerge 时两个对象大小必须一致
# ffmpeg -i ${video1} -i ${png} -i ${png} -i ${mask} -i ${video2} -i ${gif} -i ${svg} -loop 3 -filter_complex "[1]crop=100:50:0:0[cropped1];[2]crop=100:50:0:0[cropped2];[3]alphaextract[amask];[amask]scale=100:100[vmask];[4:v]scale=100:100[cropped4];[cropped4][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][cropped2]overlay=W-w-10:100[ov2];[ov2][avatar]overlay=W-w:H/3[ov3];[5:v]scale=50:50[gif];[ov3][gif]overlay=W-w-10:H/2[ov4];[ov4]subtitles=resources/subtitles.srt[final];[final]drawtext=text=string1:fontfile=foo.ttf:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2" -max_muxing_queue_size 1024 ${outputvideo}

# # 从会议中拉取流
# ffmpeg -i ${video1} -i ${png} -i ${mask} -i ${video2} -i ${gif} -filter_complex "[1]crop=100:50:200:200[cropped1];[2]alphaextract[amask];[amask]scale=150:150[vmask];[3:v]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[4:v]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2" -max_muxing_queue_size 1024 -f matroska - | ffplay -


# # 添加绿幕背景
# ffmpeg -i ${video1} -i ${png} -i ${mask} -i ${video2} -i ${gif} -i ${dh}  -filter_complex "[1]crop=100:50:200:200[cropped1];[2]alphaextract[amask];[amask]scale=150:150[vmask];[3:v]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[4:v]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[5:v]scale=150:-1,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20:H*0.6[ov5];[ov5]subtitles=${subtitles}[final];[final]drawtext=text=string1:fontfile=${font}:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2" -max_muxing_queue_size  1024  ${outputvideo}flv

# # # 循环播放
# ffmpeg -i ${video1}    -filter_complex "loop=loop=-1:size=500:start=0" -max_muxing_queue_size  1024  -r 25 -f flv rtmp://121.5.133.154:1935/myapp/12345

# # 简单转码, 设置码率(清晰度) -b 2M     直播时固定输入帧率 -re
# ffmpeg -re -i ${office} -filter_complex "scale=500:-1,drawtext=fontfile=${font}:text=TXCO:x=30:y=20:fontcolor=green:fontsize=50" -c:v flv -b:v 3M -f flv rtmp://121.5.133.154:1935/myapp/12345


# # -q 参数可以压制调试模式的数据输出
#  gst-launch-1.0 -v videotestsrc pattern=snow ! video/x-raw,width=1280,height=720  ! filesink location= /dev/stdout | ffmpeg -y -i - -codec copy -f flv test.flv


# # 从 gstreamer 输出到 ffmpeg
# # fdsink 可替换成 filesink location=/dev/stdout
# gst-launch-1.0 -v -q  videotestsrc pattern=0 ! video/x-raw,width=1280,height=720  ! matroskamux ! fdsink | ffmpeg -y -i - -i ${rtmp} -filter_complex "[1:v]scale=150:-1[ov1];[0][ov1]overlay=-20:H*0.6" -c:v libx264 -t 5 -preset faster -crf 25 -r 30 ${outputvideo}mp4

# # 从 gst 输出一个源作为 ffmpeg 的输入进行合成
# gst-launch-1.0 -v -q filesrc location=${video1} ! fdsink | ffmpeg -i - -i ${png} -i ${mask} -i ${video2} -i ${gif} -i ${dh}  -filter_complex "[1]crop=100:50:200:200[cropped1];[2]alphaextract[amask];[amask]scale=150:150[vmask];[3:v]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[4:v]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[5:v]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[ov5]subtitles=${subtitles}[final];[final]drawtext=textfile=${drawtextfile}:reload=1:fontfile=${font}:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2"  ${outputvideo}mp4

# # 多文件合成
# ffmpeg -i ${video1} -i ${png} -i ${mask} -i ${video2} -i ${gif} -i ${dh}  -filter_complex "[1]crop=100:50:200:200[cropped1];[2]alphaextract[amask];[amask]scale=150:150[vmask];[3:v]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[ov2][gif]overlay=W-w-10:H/2[ov3];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[4:v]scale=50:50[gif];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[5:v]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov5]subtitles=${subtitles}[final];[final]drawtext=textfile=${drawtextfile}:reload=1:fontfile=${font}:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2"  ${outputvideo}mp4

# # 多文件合成 （所有文件从 movie 的输入）
# ffmpeg -i /opt/application/tx-rtcStream/files/resources/screen18s.mp4  -filter_complex "movie=/opt/application/tx-rtcStream/files/resources/screen5s.mp4[0];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/filevideo.mp4[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[m4];[m0]crop=200:200:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=100:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+n:100[ov5];[ov5]subtitles=${subtitles}[final];[final]drawtext=text=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=10:y=100:fontcolor=white:fontsize=100:shadowx=2:shadowy=2"  ${outputvideo}mp4

# # 从 movie 输入 https 文件, 注意转义字符/单引号
# # 如果是从 txt 文件中读取，应该写成 movie='rtmp\://175.178.31.221\:51013/live/m25822721816395777'
# ffmpeg -i /opt/application/tx-rtcStream/files/resources/screen5s.mp4  -filter_complex "movie=/opt/application/tx-rtcStream/files/resources/screen5s.mp4[0];movie='https\\://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg'[m0];movie=${mask}[m1];movie=${video1}[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie='rtmp\\://175.178.31.221\\:51013/live/m25824109577371649'[m4];[m0]crop=200:200:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[0][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=100:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+n:100[ov5];[ov5]subtitles=${subtitles}[final];[final]drawtext=text=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=10:y=100:fontcolor=white:fontsize=100:shadowx=2:shadowy=2"  ${outputvideo}mp4


ffmpeg -i /opt/application/tx-rtcStream/files/resources/screen5s.mp4  -filter_complex "movie=/opt/application/tx-rtcStream/files/resources/video2.mp4[region_0.0.0];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[region_1.0.0];movie=/opt/application/tx-rtcStream/files/resources/office10s.mp4[region_1.0.1];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[region_2.0.1];movie=/opt/application/tx-rtcStream/files/resources/image1.jpg[region_2.1.1];[region_0.0.0]scale=w=-1:h=100[region_0.0.0_prepro];[region_1.0.0]scale=w=200:h=300,drawbox=x=10:y=10:w=50:h=100:color=red:thickness=5,chromakey=color=0x00ff00:similarity=0.3:blend=0.05[region_1.0.0_prepro];[region_1.0.1]crop=w=700:h=700:x=100:y=200,scale=w=200:h=200[region_1.0.1_prepro];[region_2.0.1]crop=w=100:h=200:x=200:y=300[region_2.0.1_prepro];[region_2.1.1]scale=w=300:h=-1,gblur=sigma=50:steps=2[region_2.1.1_prepro];movie=/opt/application/tx-rtcStream/files/resources/mask.png[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200:[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[0][region_0.0.0_prepro]overlay=500:50[out0];[out0][region_1.0.0_prepro]overlay=x=5*n:y=500+n*(n-50)[out1];[out1][region_1.0.1_maskmerge]overlay=x=10:y=10[out2];[out2][region_2.0.1_prepro]overlay=x=100+(n-20)*(n-20):y=200[out3];[out3][region_2.1.1_prepro]overlay=x=20:y=600[out4];[out4]subtitles=filename=/opt/application/tx-rtcStream/files/resources/subtitles.srt:force_style='Fontsize=8,PrimaryColour=&H0230bf&'[outText_region_3.0.0];[outText_region_3.0.0]drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:x=(w-text_w)/2-n:y=h-150*t-n*5:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:fontcolor=red:fontsize=60:shadowx=20:shadowy=10[outText_region_4.0.0];[outText_region_4.0.0]drawtext=text=text字幕:x=300:y=300:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:fontcolor=green:fontsize=20"  ${outputvideo}.mp4


# # 打开多个文件时可以把其他文件放到 filter 中的 movie 路径
# ffmpeg -re -i ${office} -filter_complex "movie=${png}[m0];movie=${video1}[m1];[m0]scale=200:-1[m0scale];[m1]scale=300:-1[m1scale];[0][m0scale]overlay=2:2[out1];[out1][m1scale]overlay=200:100" -t 5 ${outputvideo}mp4


# # scale 视频
#  ffmpeg -re -i ${screen5s} -filter_complex "scale=200:350" -t 5 ${outputvideo}mp4




# # #  test-hz 服务器上 ffmpeg 的构造
# PKG_CONFIG_PATH="/opt/program/ffmpeg/lib/pkgconfig" ./configure \
#   --pkg-config-flags="--static" \
#   --extra-cflags="-I/opt/program/ffmpeg/include" \
#   --extra-ldflags="-L/opt/program/ffmpeg/lib" \
#   --extra-libs="-lpthread -lm" \
#   --ld="g++"  --prefix=/opt/program/ffmpeg --enable-shared --enable-gpl --enable-version3 --enable-static --disable-debug --disable-ffplay --disable-indev=sndio --disable-outdev=sndio --cc=gcc --enable-fontconfig  --enable-gnutls --enable-gmp --enable-gray --enable-libaom --enable-libfribidi --enable-libass --enable-libfreetype --enable-libmp3lame --enable-libopus --enable-libvpx  --enable-libx264 --enable-libx265 


# # c 程序转码时绘制文本
# drawtext=text=string1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40

# # 源码 overlay image 和 video
#  movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/screen5s.mp4[m1];[in][m0]overlay=20:200[out1];[out1][m1]overlay=200:100

# # 源码 scale 大小
# scale=200:-300


# # 背景视频+预设轨迹多图片
# movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m4];[m0]crop=100:50:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2

# # 添加一个视频（dh) 预设轨迹
# movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[m4];[m0]crop=100:50:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2

# # 两个数字人视频
# movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[m2];movie=/opt/application/tx-rtcStream/files/resources/fileimage.png[m3];movie=/opt/application/tx-rtcStream/files/resources/dh.mp4[m4];[m0]crop=100:50:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=10:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=-20+5*n:H*0.2[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=textfile=/opt/application/tx-rtcStream/files/resources/drawtext.txt:reload=1:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=(w-text_w)/2:y=h-80*t:fontcolor=white:fontsize=40:shadowx=2:shadowy=2


end_time=$(date +%s)


echo shell-execution time was `expr $end_time - $timestamp` s



## 左右两个视频对比
ffmpeg -i 10_input.mp4 -filter_complex "[0:v]split=2[v0][v1];[v0]scale=640x480,setsar=1,pad=1280:480:0:0[v0];[v1]scale=640x480,setsar=1, hue=s=0,boxblur=3:1[v1];[v0][v1]overlay=w" -c:a copy -y 10_output.mp4 

ffmpeg -i forest.mp4 -filter_complex "[0:v]split=2[v0][v1];[v0]pad=2732:720:0:0[v0];[v1]hue=s=0,boxblur=3:1[v1];[v0][v1]overlay=w" -c:a copy -y forest_splitter_output.mp4 

ffmpeg -i forest.mp4 -i forest_output.mp4 -filter_complex "[0]pad=2732:720:0:0[v0];[v0][1]overlay=w" -c:a copy -y forest_splitter_output.mp4

ffmpeg -i /opt/application/tx-rtcStream/files/resources/office30s.mp4 -i rtmp://liveplay.ivh.qq.com/live/m1568283098611713 -filter_complex "[0:v][1:v]overlay=20:20" -an -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 2 -ssrc 2222 -payload_type 101 -f rtp rtp://${this.channel.videoTransport.ip}:${this.channel.videoTransport.port}


## 淡入淡出
ffmpeg -i forest.mp4 -loop 1 -i globalmap.jfif -filter_complex "[1:v]fade=in:st=0:d=5,scale=200:-1[v1];[0:v][v1]overlay=10:10" -pix_fmt yuv420p -c:a copy -t 10 -y forest_image_fade.mp4


## 持续一段时间后消失
ffmpeg -i forest.mp4 -loop 1 -i globalmap.jfif -filter_complex "[1:v]trim=duration=5,scale=640x360[v1];[0:v][v1]overlay=10:10:enable='between(t,0,5)'" -pix_fmt yuv420p -c:a copy forest_overlay_trim.mp4


# 转场 
# 需要先统一处理图片至相同的 DAR (scale=1200:600) 和 SAR (setsar=1:1)
ffmpeg -loop 1 -t 5 -i image1.jpg -loop 1 -t 5 -i image2.jpg -loop 1 -t 5 -i image3.jpg -loop 1 -t 5 -i image4.jpg -filter_complex "[0:v]fade=t=out:st=4:d=1[v0];[1:v]fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v1];[2:v]fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v2];[3:v]fade=t=in:st=0:d=1,fade=t=out:st=4:d=1[v3];[v0][v1][v2][v3]concat=n=4:v=1:a=0,format=yuv420p[v]" -map "[v]" -y out.mp4

# 音量检测, 其中的 I (Integrated loudness) 可以代表音量高低
# http://underpop.online.fr/f/ffmpeg/help/ebur128.htm.gz
# https://tech.ebu.ch/docs/r/r128s1.pdf
ffmpeg -i /opt/dev/rtcSdk/files/16k-2.mp3 -filter:a ebur128 audioLevel_output.mp3
# 显示音量检测结果
ffplay -f lavfi -i "amovie=mv1.mp4,ebur128=video=1:meter=18 [out0][out1]"

# 旋转
ffmpeg -i /opt/dev/rtcSdk/files/resources/office10s.mp4 -i /opt/dev/rtcSdk/files/resources/dh.mp4 -filter_complex "[1:v]format=yuva444p,rotate=-30*PI/180:ow=rotw(iw):oh=roth(ih):c=none,scale=200:-1 [rotate];[0:v][rotate] overlay=40:10:enable='between(t,0,10)', colorchannelmixer=aa=0.5" -auto-alt-ref 0 -pix_fmt yuv420p -c:a copy -y overlayavatar.mp4

# 圆形蒙版（背景未去除）
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[region_0.0]scale=w=454:h=240,boxblur=lr=1:lp=1[region_0.0_prepro];[region_1.0.1]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200,chromakey=color=0x00ff00:similarity=0.3:blend=0.05[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[region_0.0_prepro][region_1.0.1_maskmerge]overlay=(W-w)/5:(H-h)/10" -c:v libx264 -y mask.mp4


# 圆形蒙版（尝试去除背景）
ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[region_0.0]scale=w=454:h=240[region_0.0_prepro];[region_1.0.1]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]chromakey=color=0x00ff00:similarity=0.3:blend=0.05,alphamerger[region_1.0.1_maskmerge];[region_0.0_prepro][region_1.0.1_maskmerge]overlay=(W-w)/5:(H-h)/10" -c:v libx264 -y mask.mp4

ffmpeg  -i /opt/application/tx-rtcStream/files/resources/office10s.mp4  -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -filter_complex "[0:v]null[region_0.0];[1:v]null[region_1.0.1];[region_0.0]scale=w=454:h=240[region_0.0_prepro];[region_1.0.1]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200[region_1.0.1_prepro];movie='/opt/application/tx-rtcStream/files/resources/mask.png'[region_1.0.1_mask];[region_1.0.1_mask]alphaextract,scale=w=200:h=200[region_1.0.1_premask];[region_1.0.1_prepro][region_1.0.1_premask]alphamerge[region_1.0.1_maskmerge];[region_0.0_prepro][region_1.0.1_maskmerge]overlay=(W-w)/5:(H-h)/10" -c:v libx264 -y mask_circle.mp4


# extract alpha channel, white is opaque, black is transparent
ffmpeg -i /opt/dev/rtcSdk/files/resources/mask.png -vf "alphaextract" output.mp4

,chromakey=color=0x00ff00:similarity=0.3:blend=0.05

ffmpeg -i /opt/application/tx-rtcStream/files/resources/office10s.mp4 -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -i /opt/application/tx-rtcStream/files/resources/mask.png -filter_complex "[1:v]crop=w=300:h=300:x=130:y=130,scale=w=200:h=200,chromakey=0x00FF00:0.1:0.2[masked];[2:v]scale=w=200:h=200[maskpng];[masked][maskpng]alphamerge[overlay];[0:v][overlay]overlay=0:0[outv]" -map "[outv]" output_mask.mp4

# geq filter 可能有用
ffmpeg -i /opt/application/tx-rtcStream/files/resources/office10s.mp4 -i /opt/application/tx-rtcStream/files/resources/dh.mp4 -i /opt/application/tx-rtcStream/files/resources/mask.png -filter_complex "[1:v]format=rgba,colorkey=0x00FF00:0.1:0.2,geq=lum_expr='r=128:g=128:b=128':128,maskfun='r(X,Y)':128:128[masked];[masked][2:v]alphamerge[overlay];[0:v][overlay]overlay=0:0[outv]" -map "[outv]" -y output.mp4
