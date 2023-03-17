 
# 5 秒长的视频
gst-launch-1.0 videotestsrc num-buffers=150 ! video/x-raw,width=1280,height=720,framerate=30/1 ! videoconvert ! x264enc ! mp4mux ! filesink location=output.mp4
