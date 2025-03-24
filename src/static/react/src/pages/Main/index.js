import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import socket from '../../socket/index'
import ACTIONS from '../../../src/socket/actions'
import { v4 } from 'uuid'

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
                                history(`/room/${roomID}`)
                            }}>JOIN ROOM</button>
                        </li>
                    ))
                }
            </ul>
            <button onClick={() => {
                history(`/room/${v4()}`)
            }}>CREATE NEW ROOM</button>
        </div>
    )
}