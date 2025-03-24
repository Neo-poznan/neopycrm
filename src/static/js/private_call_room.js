const socket = io('http://127.0.0.1:5001', {'transports': ['websocket'], 'query': {'user_id': user_id}});

const localVideo = document.getElementById('my-video');

let localStream;
let peerConnection;


async function createStream() {
    localStream = await navigator.mediaDevices.getUserMedia({'video': true, 'audio': true});
    localVideo.srcObject = localStream;
    console.log('stream created');
};

$('.get-media').click(createStream);

function onAddIce(event) {
  console.log('local-description', JSON.stringify(peerConnection.localDescription));
  socket.emit('offer', peerConnection.localDescription);
};

async function main() {
  peerConnection = new RTCPeerConnection();
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track)
  });
  peerConnection.addTrack
  peerConnection.onicecandidate = onAddIce;
  let offer = await peerConnection.createOffer();
  console.log('created offer');
  await peerConnection.setLocalDescription(offer);
};

$('.offer').click(main);

async function onAnswer (answer) {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  console.log('remote description set');
  console.log('answer:', new RTCSessionDescription(answer));
  };



socket.on('answer', (answer) = onAnswer);






