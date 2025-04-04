import {useCallback, useEffect, useRef} from 'react';
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


    const peerConnections = useRef({});
    const localMediaStream = useRef({});
    const peerMediaElements = useRef({
        [LOCAL_VIDEO]: null,
    });

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
    const provideMediaRef = useCallback((id, node) => {
        peerMediaElements.current[id] = node;
    }, []);
    return {
        clients,
        provideMediaRef
    };
}