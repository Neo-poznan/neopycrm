import './fixedVideo.css'

export default function FixedVideo(props) {
    return (

        <video
        ref={instance => {
            props.provideMediaRef(instance);
        }}
        autoPlay
        playsInline
        id="fixed-video"
        />
    )
}