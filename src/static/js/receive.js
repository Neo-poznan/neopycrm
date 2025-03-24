const socket = io('http://127.0.0.1:5001', {'transports': ['websocket'], 'query': {'user_id': user_id}});

const remoteVideo = document.getElementById('remote-video');
let peerConnection;



function onIce (e) {
  console.log('local description:', JSON.stringify(peerConnection.localDescription));
  socket.emit('answer', peerConnection.localDescription);
};

async function onOffer (offer) {

  peerConnection = new RTCPeerConnection();
  peerConnection.onicecandidate = onIce;
  peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
    console.log('truck added');
  };
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  console.log('remote description set');
  console.log('offer:',offer);
  const answer = await peerConnection.createAnswer() ; 
  await peerConnection.setLocalDescription(answer);
};

socket.on('offer', (offer) = onOffer);
