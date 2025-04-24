import React, { useState, useEffect } from "react";
import axios from "axios";
import socket from "../../socket";
import './userInfo.css';

export default function UserInfo(props) {
    const [userInfo, setUserInfo] = useState(null); // Состояние для хранения данных пользователя
    const [error, setError] = useState(null); // Состояние для хранения ошибок
    const LOCAL_VIDEO = 'LOCAL_VIDEO';

    useEffect(() => {
        // Загружаем данные с сервера при монтировании компонента
        let clientID
        if ( props.peerID===LOCAL_VIDEO ) {
            clientID = socket.id;
        }
        else {
            clientID = props.peerID;
        }
        axios.get(`/user/get-user-info-by-peer-id/${clientID}`)
            .then(response => {
                if (response.status === 200) {
                    setUserInfo(response.data); // Сохраняем данные пользователя в состоянии
                } else {
                    setError("Ошибка загрузки данных с сервера");
                }
            })
            .catch(err => {
                console.error("Ошибка при загрузке данных:", err);
                setError("Ошибка загрузки данных с сервера");
            });
    }, [props.peerID]); // Эффект срабатывает при изменении props.peerID

    // Если есть ошибка, отображаем сообщение об ошибке
    if (error) {
        return <p>{error}</p>;
    }
 
    // Если данные еще загружаются, отображаем индикатор загрузки
    if (!userInfo) {
        return <p>Загрузка...</p>;
    }

    // Если данные успешно загружены, отображаем их
    return (
        <div className="user-label"> 
            <img src={userInfo.avatar_url} alt="Avatar" />
            <p>{userInfo.first_name + " " + userInfo.last_name}</p>
            
        </div>
    );
}