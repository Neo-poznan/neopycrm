import './video.css';
import UserInfo from './userInfo';

export default function Video(props) {
    console.log('info about speaking from video component:', props.clientID, props.activePeers[props.clientID]);

    return (
        <div className="video-container" key={props.clientID}>
                {
                    props.disabledVideos[props.clientID] && <UserInfo peerID={props.clientID}/>
                }
            <div class="fix-button-container">
                <button class="fix-button" onClick={ (e) => {
                    props.fix(props.clientID);
                }}>
                    <i class="ri-pushpin-line"></i>
                </button>
            </div>
            <video
            ref = {instance => {
                props.provideMediaRef(props.clientID, instance);


            }}
            autoPlay
            playsInline
            muted={props.clientID === 'LOCAL_VIDEO'}
            className="user-video"
            style={{
                border: props.activePeers[props.clientID] ? '5px solid green' : '3px solid rgb(160, 160, 160)',
            }}
            />

        </div>
    )
}