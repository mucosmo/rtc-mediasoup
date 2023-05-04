const fs = require('fs');
const wrtc = require('wrtc');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 3354 });

// create a WebRTC peer connection
const pc = new wrtc.RTCPeerConnection();

// create a data channel
const dataChannel = pc.createDataChannel('dataChannel');
dataChannel.onopen = () => {
    console.log('Data channel opened');
};

pc.c

// read from the FIFO
const fifoPath = '/opt/application/tx-rtcStream/server/lab/ffmpeg.fifo';
const readStream = fs.createReadStream(fifoPath);

readStream.on('data', (data) => {
    console.log(data)
    // send data to the WebRTC data channel
    // dataChannel.send(data);
});

// // handle incoming WebRTC data channel messages
// dataChannel.onmessage = (event) => {
//   console.log('Received message:', event.data);
// };

// // handle incoming WebRTC ICE candidates
// pc.onicecandidate = (event) => {
//   console.log('Received ICE candidate:', event.candidate);
//   // send ICE candidate to remote peer
//   wss.broadcast(JSON.stringify({ type: 'iceCandidate', data: event.candidate }));
// };

// // handle incoming WebRTC offer
// wss.on('connection', (ws) => {
//   console.log('Websocket connection established');

//   ws.on('message', (message) => {
//     const { type, data } = JSON.parse(message);
//     if (type === 'offer') {
//       console.log('Received offer:', data);

//       pc.setRemoteDescription(new wrtc.RTCSessionDescription(data))
//         .then(() => pc.createAnswer())
//         .then((answer) => pc.setLocalDescription(answer))
//         .then(() => {
//           // send answer to remote peer
//           wss.broadcast(JSON.stringify({ type: 'answer', data: pc.localDescription }));
//         })
//         .catch((error) => console.error('Error creating answer:', error));
//     } else if (type === 'iceCandidate') {
//       console.log('Received ICE candidate:', data);
//       pc.addIceCandidate(new wrtc.RTCIceCandidate(data))
//         .catch((error) => console.error('Error adding ICE candidate:', error));
//     }
//   });
// });

// wss.broadcast = function broadcast(data) {
//   wss.clients.forEach(function each(client) {
//     if (client.readyState === WebSocket.OPEN) {
//       client.send(data);
//     }
//   });
// };
