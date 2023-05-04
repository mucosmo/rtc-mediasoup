const config = require('../../server/config');

let protooPort = config.https.listenPort;

if (window.location.hostname === 'test.mediasoup.org')
	protooPort = 4444;

export function getProtooUrl({ roomId, peerId })
{
	const hostname = window.location.hostname;
	return `wss://${hostname}:${4445}/?roomId=${roomId}&peerId=${peerId}`;
}
