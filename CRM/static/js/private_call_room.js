const socket = io('http://127.0.0.1:5001', {'transports': ['websocket']});

function generateUniqueSSRC() {
    return Math.floor(Math.random() * 4294967295);
}

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
        document.getElementsByClassName('my-video')[0].srcObject = stream;

        stream.getTracks().forEach(track => {
            const rtpParameters = {
                codecs: [
                    {
                        mimeType: 'video/VP8',
                        payloadType: 96,
                        clockRate: 90000,
                        parameters: {
                            'x-google-start-bitrate': 1000,
                        },
                    },
                ],
                headerExtensions: [
                    {
                        uri: 'urn:ietf:params:rtp-hdrext:sdes:mid',
                        id: 1,
                    },
                    {
                        uri: 'urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id',
                        id: 2,
                    },
                ],
                encodings: [
                    {
                        ssrc: generateUniqueSSRC(), // Генерация уникального идентификатора для потока
                        maxBitrate: 1000000,
                    },
                ],
            };

            socket.emit('broadcast-stream', { kind: track.kind, rtpParameters: rtpParameters });
        });
    });

socket.on('producer-created', producerId => {
    console.log('Producer created with ID:', producerId);
});

