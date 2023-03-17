 
# 5 秒长的视频
gst-launch-1.0 videotestsrc num-buffers=150 ! video/x-raw,width=1280,height=720,framerate=30/1 ! videoconvert ! x264enc ! mp4mux ! filesink location=output.mp4

# pattern
gst-launch-1.0 videotestsrc pattern=23 num-buffers=150 ! video/x-raw,width=1280,height=720,framerate=30/1 ! videoconvert ! x264enc ! mp4mux ! filesink location=output.mp4

# 检查某个元素
gst-inspect-1.0 videotestsrc
gst-inspect-1.0 x264enc
gst-inspect-1.0 | grep libav #检查 ffmpeg 插件（gst-libav)