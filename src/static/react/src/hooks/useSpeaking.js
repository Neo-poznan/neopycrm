import { useRef, useState, useEffect } from 'react'


export default function useSpeaking (videoElement) {
    const [ isSpeaking, setIsSpeaking ] = useState(false);

    const stream = useRef(videoElement.srcObject);


    useEffect(() => {
        if (!stream) return;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream.current);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        analyser.fftSize = 256; // Размер Fast Fourier Transform
        analyser.smoothingTimeConstant = 0.8; // Сглаживание данных
        microphone.connect(analyser);

        const checkVolume = () => {
            analyser.getByteFrequencyData(dataArray); // Получаем данные частот
            const volume = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length; // Средняя громкость

            // Устанавливаем порог громкости (например, 20)
            if (volume > 20) {
                setIsSpeaking(true);
                console.log('speaking...');
            } else {
                setIsSpeaking(false);
            }

            requestAnimationFrame(checkVolume); // Рекурсивно вызываем для постоянного анализа
        };

        checkVolume();

        return () => {
            // Очищаем ресурсы
            microphone.disconnect();
            analyser.disconnect();
            audioContext.close();
        };
    }, [stream.current]);
    return isSpeaking;

}