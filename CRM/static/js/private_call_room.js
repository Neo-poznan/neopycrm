//const socket = io('http://127.0.0.1:5001', {'transports': ['websocket'], 'query': {'user_id': user_id}});


let localPeer

let localStream

let remotePeer

const localVideo = document.getElementsByClassName('my-video')[0]
const remoteVideo = document.getElementsByClassName('interlocutor-video')[0]

let offerConstrains


const servers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

async function createStream() {
    localStream = await navigator.mediaDevices.getUserMedia({'video': true, 'audio': true})
    // localVideo.srcObject = localStream
}

$('.get-media').click(createStream)

function sendDescriptionToRemote(desc) {

}
var offerConstraints = {};
function offerCreationSuccess(desc) {
    console.log('Успешно создан оффер. Устанавливается локальное описание для локального пира')
    localPeer.setLocalDescription(desc)
    remotePeerReceivedOffer(desc)

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
      remotePeer.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  }

function onAddRemoteStreamToLocalPeer(event) {
    console.log("Видео с удаленного пира было добавлено на локальный пир");
    // remoteVideo1.srcObject = event.stream;
}

  function createOfferOnClick() {
    console.log("createOffer_click()");
    localPeer = new webkitRTCPeerConnection(servers); // Создаем RTCPeerConnection
    console.log('Local peer created')
    localPeer.onicecandidate = onAddIceCandidateOnLocalPeer;    // Callback-функция для обработки ICE-кандидатов
    localPeer.onaddstream = onAddRemoteStreamToLocalPeer;          // Callback-функция, вызываемая при появлении медиапотока от дальней стороны. Пока что его нет
    localPeer.addStream(localStream); // Передадим локальный медиапоток (предполагаем, что он уже получен)

    createOffer()
}

$('.offer').click(createOfferOnClick)

function OnSuccessAnswerCreationPeer2(desc) {  
    remotePeer.setLocalDescription(desc);
    console.log("Ответ успешно создан! Теперь устанавливаем одно и то же описание в качестве Локального на удаленном пире и удаленного на локальном", desc.sdp);
    localPeer.setRemoteDescription(desc);
  }


function Peer2OnErrorCreationAnswer(error) {
console.log('Error creating answer!', error);
}


var answerConstraints = { 
'mandatory': { 'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true } 
};

function onAddCandidateOnRemotePeer(event) {
    if (event.candidate) {
      console.log("На удаленном пире установлен кандидат. Вызов локального пира для добавления кандидата этого же кандидата.", event.candidate.candidate);
      localPeer.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  }

function onAddLocalStreamToRemotePeer(event) {
    console.log('Видео с локального пира было добавлено на удаленный пир')
    remoteVideo.srcObject = event.stream
}

function remotePeerReceivedOffer(desc) {
    console.log("pc2_receiveOffer()", desc);
    // Создаем объект RTCPeerConnection для второго участника аналогично первому
    remotePeer = new webkitRTCPeerConnection(servers);
    remotePeer.onicecandidate = onAddCandidateOnRemotePeer; // Задаем обработчик события при появлении ICE-кандидата
    remotePeer.onaddstream = onAddLocalStreamToRemotePeer; // При появлении потока подключим его к HTML <video>
    // pc2.addStream(localStream); // Передадим локальный медиапоток (в нашем примере у второго участника он тот же, что и у первого)
    // Теперь, когда второй RTCPeerConnection готов, передадим ему полученный Offer SDP (первому мы передавали локальный поток)
    console.log('Создан второй пир. Устанавливается удаленное описание переданное из первого пира.')
    remotePeer.setRemoteDescription( new RTCSessionDescription(desc) );
    // Запросим у второго соединения формирование данных для сообщения Answer
    remotePeer.createAnswer( 
      OnSuccessAnswerCreationPeer2,
      Peer2OnErrorCreationAnswer,
      answerConstraints
    );
  }
  
function disconnect() {
    localPeer.close();
    remotePeer.close()
}

$('.disconnect').click(disconnect)







 
