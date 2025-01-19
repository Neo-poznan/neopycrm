const socket = io('http://127.0.0.1:5001', {'transports': ['websocket'], 'query': {'user_id': user_id}});


let localPeer;

const remoteVideo = document.getElementById('remote-video')

const servers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ]
};

function OnSuccessAnswerCreation(desc) {  
  localPeer.setLocalDescription(desc);
  console.log("Ответ успешно создан! Теперь устанавливаем одно и то же описание в качестве Локального на локальном пире и удаленного на пире 1", desc.sdp);
  socket.emit('set_description', JSON.stringify({'description': desc}))
}


function OnErrorCreationAnswer(error) {
console.log('Error creation answer!', error);
}


var answerConstraints = { 
'mandatory': { 'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true } 
};

function onAddCandidateToLocalPeer(event) {
    if (event.candidate) {
      console.log("На локальном пире установлен кандидат. Вызов удаленного пира 1 для установки этого же кандидата.", event.candidate.candidate);
      socket.emit('ice_candidates', JSON.stringify({'candidate': event.candidate}))
    }
  }



function onAddRemoteStreamToLocalPeer(event) {
    console.log('Видео с пира 1 было добавлено на пир 2');
    console.log(remoteVideo);
    console.log(event.stream);
    remoteVideo.srcObject = event.stream;
    console.log(remoteVideo.srcObject);
}

function onReceivedOffer(desc) {
    console.log("pc2_receiveOffer()", desc);
    // Создаем объект RTCPeerConnection для второго участника аналогично первому
   localPeer = new RTCPeerConnection(servers);
   localPeer.onicecandidate = onAddCandidateToLocalPeer; // Задаем обработчик события при появлении ICE-кандидата
   localPeer.onaddstream = onAddRemoteStreamToLocalPeer; // При появлении потока подключим его к HTML <video>
    // Теперь, когда второй RTCPeerConnection готов, передадим ему полученный Offer SDP (первому мы передавали локальный поток)
    console.log('Создан второй пир. Устанавливается удаленное описание переданное из первого пира.')
    console.log('Offer: ', desc)
   localPeer.setRemoteDescription(desc);
    // Запросим у второго соединения формирование данных для сообщения Answer
   localPeer.createAnswer( 
      OnSuccessAnswerCreation,
      OnErrorCreationAnswer,
      answerConstraints
    );
  }

socket.on('created_offer', (arg) => {
   let desc_json = JSON.parse(arg)
   let desc = desc_json.offer
   onReceivedOffer(desc)
});

socket.on('ice_candidates', (arg) => {
  let arg_json = JSON.parse(arg)
  let arg_data = arg_json.candidate
  localPeer.addIceCandidate(new RTCIceCandidate(arg_data))
  console.log('Получено сообщение из сокета. Добавлен кандидат из него на пир.', arg_data)
});
