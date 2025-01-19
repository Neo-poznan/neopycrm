const socket = io('http://127.0.0.1:5001', {'transports': ['websocket'], 'query': {'user_id': user_id}});


let localPeer;

let localStream;

const localVideo = document.getElementsByClassName('my-video')[0]
const remoteVideo = document.getElementsByClassName('interlocutor-video')[0]

let offerConstrains;


const servers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302'},
    ]
  };

async function createStream() {
    localStream = await navigator.mediaDevices.getUserMedia({'video': true, 'audio': true})
    localVideo.srcObject = localStream
}

$('.get-media').click(createStream)

var offerConstraints = {};

function offerCreationSuccess(desc) {
    console.log('Успешно создан оффер. Устанавливается локальное описание для локального пира 1. Передается на вторую страницу.')
    console.log('Offer: ', desc)
    localPeer.setLocalDescription(desc)
    socket.emit('created_offer', JSON.stringify({'offer': desc}))
}


function offerCreationError (error) {
    console.log('Error creation offer', error)
}


function createOffer() {
    localPeer.createOffer(
        offerCreationSuccess,
        offerCreationError,
        offerConstraints
    )
}

function onAddIceCandidateOnLocalPeer(event){
    if (event.candidate) {
      console.log("Добавлен ice candidate на локальный пир. Вызов удаленного пира для добавления кандидата на него"+ event.candidate.candidate.replace("\r\n", ""), event.candidate);
      // вызываем удаленный пир для добавления кандидата
      socket.emit('ice_candidates', JSON.stringify({'candidate': event.candidate}))
    }
  }


function onAddRemoteStreamToLocalPeer(event) {
    console.log("Видео с удаленного пира было добавлено на локальный пир");
    // remoteVideo.srcObject = event.stream;
}

  function createOfferOnClick() {
    console.log("createOffer_click()");
    localPeer = new RTCPeerConnection(servers); // Создаем RTCPeerConnection
    console.log('Local peer created')
    localPeer.onicecandidate = onAddIceCandidateOnLocalPeer;    // Callback-функция для обработки ICE-кандидатов
    localPeer.onaddstream = onAddRemoteStreamToLocalPeer;          // Callback-функция, вызываемая при появлении медиапотока от дальней стороны. Пока что его нет
    localPeer.addStream(localStream); // Передадим локальный медиапоток (предполагаем, что он уже получен)


    createOffer()
}

$('.offer').click(createOfferOnClick)

  
function disconnect() {
    localPeer.close();
}

$('.disconnect').click(disconnect)


socket.on('ice_candidates', (arg) => {
    
    let arg_json = JSON.parse(arg)
    let arg_data = arg_json.candidate
    localPeer.addIceCandidate( new RTCIceCandidate(arg_data))
    console.log('Получено сообщение из сокета. Добавлен кандидат из него на пир.', arg_data)
});

socket.on('set_description', (arg) => {
    let arg_json = JSON.parse(arg)
    let arg_data = arg_json.description
    localPeer.setRemoteDescription( new RTCSessionDescription(arg_data))
    console.log('Принято описание из сокета. Установлено в качестве удаленного.')
});









 
