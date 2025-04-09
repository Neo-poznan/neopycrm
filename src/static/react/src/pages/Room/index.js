import { useParams } from 'react-router'
import { useEffect } from 'react'
import useWebRTC from '../../hooks/useWebRTC';

export default function Room() {
    const {id: roomID} = useParams();

    const {clients, provideMediaRef} = useWebRTC(roomID);

    console.log(clients);

    useEffect(() => {
        const sessionCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionid'))
        ?.split('=')[1];

        fetch(`/calls/group-call-authorization/${roomID}/`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookies': `sessionid=${sessionCookie}`
                }
            }
        )
        .then(response => {
            console.log(response.status);
            if (response.status === 403) {
                alert('У вас нет доступа к этому звонку!');
            }

        })
    }, [])

    return(
        <div>
           {clients.map((clientID) => {
            return (
                <div key={clientID}>
                    <video
                    ref = {instance => {
                        provideMediaRef(clientID, instance);

                    }}
                    autoPlay
                    playsInline
                    muted={clientID === 'LOCAL_VIDEO'}
                    />
                </div>
            )
           })}
        </div>
    )
}