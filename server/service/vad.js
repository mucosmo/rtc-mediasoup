// voice activity detection

// inform the acitve speaker to the client
function activeSpeaker(data) {
    const ws = global.wsActiveSpeaker;
    if (ws) {
        ws.send(JSON.stringify({ name: 'activeSpeaker', data }))
    }
}

module.exports = {
    activeSpeaker
}