import {startTransition, useCallback, useEffect, useRef, useState} from 'react';
import useStateWithCallback from './useStateWithCallback';
import ACTIONS from '../socket/actions';
import socket from '../socket'
import freeice from 'freeice';

const LOCAL_VIDEO = 'LOCAL_VIDEO';

export default function useWebRTC(roomID) {
    const [clients, updateClients] = useStateWithCallback([]);

    const addNewClient = useCallback((newClient, cb) => {
        if (!clients.includes(newClient)) {
            updateClients(list => [...list, newClient], cb);
        }
    }, [clients, updateClients])

    const [fixedPeer, updateFixedPeer] = useStateWithCallback([]);
    const [disabledVideos, updateDisabledVideos] = useStateWithCallback({})
    const [activePeers, updataActivePeers] = useStateWithCallback({})

    const peerConnections = useRef({});
    const localMediaStream = useRef();
    const peerMediaElements = useRef({
        [LOCAL_VIDEO]: null,
    });
    const fixedVideoElement = useRef(null);

    function disableVideo (peerID) {
        console.log(peerID, 'webcam disabled');
        updateDisabledVideos((prevState) => {
            let newState = {
                ...prevState,
                [peerID]: true
            }
            return newState;
        })
    }

    function enableVideo (peerID) {
        console.log(peerID, 'webcam enabled');
        updateDisabledVideos((prevState) => {
            let newState = { ...prevState };
            delete newState[peerID];
            return newState;
        })
    }

    function setPeerActive (peerID) {
        console.log(peerID, 'active now');
        updataActivePeers((prevState) => {
            let newState = { 
                ...prevState,
                [peerID]: true
            }
            return newState
        })
    }

    function setPeerNotActive (peerID) {
        console.log(peerID, 'not active now');
        updataActivePeers((prevState) => {
            let newState = { ...prevState };
            delete newState[peerID];
            return newState;
        })
    }

    const [ isSpeaking, updateSpeaking ] = useState(false); 

    useEffect(() => {
        if ( localMediaStream.current ) {
            console.log('start scan volume', localMediaStream.current);
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(localMediaStream.current);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            analyser.fftSize = 256; // Размер Fast Fourier Transform
            analyser.smoothingTimeConstant = 0.8; // Сглаживание данных
            microphone.connect(analyser);

            const checkVolume = () => {
                analyser.getByteFrequencyData(dataArray); // Получаем данные частот
                const volume = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length; // Средняя громкость

                // Устанавливаем порог громкости (например, 20)
                if (volume > 6) {
                    updateSpeaking(true)
                    console.log('speaking...');
                } else {
                    updateSpeaking(false)
                }

                requestAnimationFrame(checkVolume); // Рекурсивно вызываем для постоянного анализа
            };

            checkVolume();            
        }

    }, [localMediaStream.current]);

    useEffect(() =>{
        console.log('is speaking:', isSpeaking);
        socket.emit(ACTIONS.SPEAKING, {
            peerID: socket.id,
            isSpeaking: isSpeaking
        });
    }, [isSpeaking])

    useEffect(() => {
        async function handleNewPeer(peerID, createOffer) {
            console.log('вызвана функция handle new peer', createOffer)
            if (peerID in peerConnections.current) {
                return console.warn(`already connected to peer ${peerID}`);
            }
            console.log(peerID);
            peerConnections.current[peerID] = new RTCPeerConnection({
                iceServers: freeice(),
            });
            peerConnections.current[peerID].onicecandidate = event => {
                if (event.candidate) {
                    socket.emit(ACTIONS.RELAY_ICE, {
                        peerID,
                        iceCandidate: event.candidate,

                    })
                }
            }
            let tracksNumber = 0;
            peerConnections.current[peerID].ontrack = ({streams: [remoteStream]}) => {
                tracksNumber++
                
                if (tracksNumber === 2) {
                    addNewClient(peerID, () => {
                        peerMediaElements.current[peerID].srcObject = remoteStream;
                    })
                }
            }
            localMediaStream.current.getTracks().forEach(track => {
                peerConnections.current[peerID].addTrack(track, localMediaStream.current);
            });
            if (createOffer) {
                const offer = await peerConnections.current[peerID].createOffer();
                await peerConnections.current[peerID].setLocalDescription(offer)

                socket.emit(ACTIONS.RELAY_SDP, {
                    peerID,
                    sessionDescription: offer,
                })
            }
            
        }

        socket.on(ACTIONS.ADD_PEER,({peerID, createOffer}) => handleNewPeer(peerID, createOffer))
    }, []);

    useEffect(() => {
        async function setRemoteMedia({peerID, sessionDescription}) {
            await peerConnections.current[peerID].setRemoteDescription(new RTCSessionDescription(sessionDescription));
            if (sessionDescription.type === 'offer') {
                const answer = await peerConnections.current[peerID].createAnswer();
                await peerConnections.current[peerID].setLocalDescription(answer);
                console.log('принят оффер');
                socket.emit(ACTIONS.RELAY_SDP, {
                    peerID,
                    sessionDescription: answer
                })
            }
        }
        socket.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia)
    }, [])
    useEffect(() => {
        socket.on(ACTIONS.ICE_CANDIDATE, ({peerID, iceCandidate}) => {
            peerConnections.current[peerID].addIceCandidate(
                new RTCIceCandidate(iceCandidate)
            );
            console.log('принят кандидат')
        });

    }, [])

    useEffect(() => {
        socket.on(ACTIONS.REMOVE_PEER, ({peerID}) => {
            console.log('сработала функция удаление клиента');
            if (peerConnections.current[peerID]) {
                peerConnections.current[peerID].close();
                delete peerConnections.current[peerID];
                delete peerMediaElements.current[peerID];
                updateClients(list => list.filter(c => c !== peerID))
            }
        });
    }, [])
    

    useEffect(() => {
        async function startCapture() {
            localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: {
                    width: 1280,
                    height: 720,
                },
            });

            addNewClient(LOCAL_VIDEO, () => {
                const localVideoElement = peerMediaElements.current[LOCAL_VIDEO];
                if (localVideoElement) {
                    localVideoElement.volume = 0;
                    localVideoElement.srcObject = localMediaStream.current;
                }

            })
        }
        startCapture().then(() => socket.emit(ACTIONS.JOIN, {room: roomID}))
        .catch(e => console.error('Error getting userMedia', e)); 
        return () => {
            localMediaStream.current.getTracks().array.forEach(track => track.stop());
            socket.emit(ACTIONS.LEAVE);
        }

    }, [roomID]);

    useEffect(() => {
        socket.on(ACTIONS.FIX_VIDEO, (data) => {
            const fixedPeer = data.fixedPeer;
            console.log('fixed peer received: ', fixedPeer);
            if (fixedPeer === socket.id) {
                console.log('локально закреплен локальный для этой страницы пир');
                fixedVideoElement.current.srcObject = peerMediaElements.current[LOCAL_VIDEO].srcObject;
            }
            else {
                console.log('локально закреплен удаленный для этой страницы пир');
                fixedVideoElement.current.srcObject = peerMediaElements.current[fixedPeer].srcObject;
            }
        })
    }, [])


    useEffect(() => {
        socket.on(ACTIONS.TOGGLE_CAMERA, (data) => {
            console.log('Toggle camera on peer:', data.peerID);
            let clientID;
            if ( data.peerID===socket.id ) {
                clientID = LOCAL_VIDEO;
            }
            else {
                clientID = data.peerID;
            }
            
            if (data.isOn) {
                enableVideo(clientID);
            }
            else {
                disableVideo(clientID);
            }
            
        })
    }, [])

    useEffect(() => {
        socket.on(ACTIONS.SPEAKING, (data) => {
            let clientID;
            if ( data.peerID===socket.id ) {
                clientID = LOCAL_VIDEO;
            }
            else {
                clientID = data.peerID
            }

            if (data.isSpeaking) {
                setPeerActive(clientID);
            }
            else {
                setPeerNotActive(clientID);
            }
        })

    }, [])

    const provideMediaRef = useCallback((id, node) => {
        console.log('provide:', peerMediaElements.current[id], node);
        peerMediaElements.current[id] = node;
        console.log('after provide:', peerMediaElements.current[id]);

    }, []);

    const provideFixedMediaRef = useCallback((node) => {
        console.log('Fixed video ref');
        fixedVideoElement.current = node;
    }, []);

    function toggleMicrophone() {
        if (localMediaStream.current) {
            const audioTrack = localMediaStream.current.getAudioTracks()[0]; // Получаем аудио-трек
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled; // Переключаем состояние
                console.log(`Микрофон ${audioTrack.enabled ? 'включен' : 'выключен'}`);
            }
        }
    }

    function toggleCamera() {
        if (localMediaStream.current) {
            const videoTrack = localMediaStream.current.getVideoTracks()[0]; // Получаем видео-трек
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled; // Переключаем состояние
                console.log(`Камера ${videoTrack.enabled ? 'включена' : 'выключена'}`);
                socket.emit(ACTIONS.TOGGLE_CAMERA, { 
                    peerID: socket.id,
                    isOn: videoTrack.enabled
                });
            }
        }
    }

    function fixVideo(elementID) {
        if ( elementID===LOCAL_VIDEO ) {
            console.log('отправлен сигнал о закреплении локального для этой страницы видео');
            socket.emit(ACTIONS.FIX_VIDEO, { fixedPeer: socket.id });
        }
        else {
            console.log('отправлен сигнал о закреплении удаленного для этой страницы видео');
            socket.emit(ACTIONS.FIX_VIDEO, { fixedPeer: elementID });
        }
    }

    
    return {
        clients,
        fixedPeer,
        disabledVideos,
        activePeers,
        provideMediaRef,
        toggleCamera,
        toggleMicrophone,
        provideFixedMediaRef,
        fixVideo
    };
}

