import { data, useParams } from 'react-router'
import { useEffect, useRef } from 'react'
import useWebRTC from '../../hooks/useWebRTC';
import Video from './video'
import './index.css'
import axios from 'axios';
import FixedVideo from './fixedVideo'
import Cookies from 'js-cookie';
import socket from '../../socket';

export default function Room() {
    const {id: roomID} = useParams();

    const {clients, fixedPeer, disabledVideos, activePeers, provideMediaRef, toggleCamera, toggleMicrophone, provideFixedMediaRef, fixVideo} = useWebRTC(roomID);

    console.log(clients);

    let isAdmin = useRef(false)

    useEffect(() => {
        axios.get(`/calls/group-call-authorization/${roomID}/`)
        .then(
            response => {
                if (response.status === 403) {
                    alert('У вас нет доступа к этому звонку!');
                }
                isAdmin.current = response.data.is_admin;

            }
        )
    }, [])

    useEffect(() => {
        socket.on('connect', () => {
            console.log('connected with id:', socket.id);
            const data = {
                peer_id: socket.id
            }
            const csrftoken = Cookies.get('csrftoken');
            console.log(document.cookie);
            fetch('/user/set-peer-user-info/',  {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify(data)
            })
        })

    }, [])



    return(
        <div id='container'>
            <main>
                <div id='video-row'> 
                    {clients.map((clientID) => {
                            console.log(isAdmin);
                            return (<Video clientID={ clientID } provideMediaRef={ provideMediaRef } fix={ fixVideo } disabledVideos={ disabledVideos } activePeers={ activePeers }></Video>)
                    })}
                </div>
                <div id="center-block-container">
                    <div id="fixed-video-container">
                        <FixedVideo peerID={ fixedPeer } provideMediaRef={ provideFixedMediaRef }></FixedVideo>
                        <div class="button-block-container">
                            <div class="mute-button-container" onClick={ toggleMicrophone }>
                                <i class="ri-mic-off-line"></i>
                            </div>
                            <div class="camera-button-container" onClick={ toggleCamera }>
                                <i class="ri-camera-off-line"></i>
                            </div>
                            <div class="exit-button-container">
                                <i class="ri-close-large-line"></i>
                            </div>
                        </div>    
                    </div>
                    <div id="chat-container">
                        <div id="chat">
                            <div class="message-container">
                                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Velit neque distinctio doloremque tenetur accusantium itaque, 
                                nulla, ratione minima autem officia, voluptate rerum ipsa quam debitis corrupti quis hic recusandae quaerat.</p>
                            </div>
                        </div>

                    </div>
            </div>
            </main>


        </div>
    )
}