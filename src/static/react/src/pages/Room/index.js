import { useParams } from 'react-router'
import useWebRTC from '../../hooks/useWebRTC';

export default function Room() {
    const {id: roomID} = useParams();

    const {clients, provideMediaRef} = useWebRTC(roomID);

    console.log(clients);
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