import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../../socket/index'
import ACTIONS from '../../../src/socket/actions'
import axios from 'axios'
import Cookies from 'js-cookie'

axios.defaults.withCredentials = true
axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";


export default function Main() {
    const [rooms, updateRooms] = useState([]);
    const history = useNavigate();
    useEffect(() => {
        socket.on(ACTIONS.SHARE_ROOMS, ({rooms = []} = {}) => {
            updateRooms(rooms);
            console.log('Комнаты:', rooms);
        })
    }, []);


    return(
        <div>
            <h1>Активные комнаты</h1>
            <ul>
                {
                    rooms.map(roomID => (
                        <li key={roomID}>
                            {roomID}
                            <button onClick={() => {
                                history(`/calls/room/${roomID}`)
                            }}>JOIN ROOM</button>
                        </li>
                    ))
                }
            </ul>
            <button onClick={() => {
                const csrftoken = Cookies.get('csrftoken');
                console.log(csrftoken);
                console.log(document.cookie);

                axios.post('/calls/create-group-call/', {
                headers: {
                'X-CSRFToken': csrftoken
                }
                })
                .then(response => console.log(response.data))


                
                
            }}>CREATE NEW ROOM</button>
        </div>
    )
}