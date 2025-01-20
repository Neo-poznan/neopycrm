const socket = io('http://127.0.0.1:5001', {'transports': ['websocket']});
   
const rtpCapabilities = {
  mediaCodecs: [
    {
      kind: 'video',
      mimeType: 'video/VP8',
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
};
function consume() {
  let producerId = document.getElementById('producer-input').value
  socket.emit('consume-stream', { producerId: producerId, rtpCapabilities: rtpCapabilities});
}

socket.on('consumer-created', ({ id, kind, rtpParameters }) => {
  const consumer = new RTCRtpReceiver(rtpParameters);
  document.querySelector('video#remote-video').srcObject = consumer.track;
});

$('#button').click(consume)



