import redis
import socketio
import eventlet

from aiortc.contrib.media import MediaRelay

from core.use_case import UserConnectionStatusUseCase

eventlet.monkey_patch()

redis_manager = socketio.RedisManager('redis://localhost:6379/0')
sio = socketio.Server(cors_allowed_origins='*', async_mode='eventlet', client_manager=redis_manager)
app = socketio.WSGIApp(sio)

@sio.event()
def connect(sid, environ):
    # Получаем параметры строки запроса
    query_params = environ.get('QUERY_STRING', '')
    user_id = None


    # Получаем значение параметра user_id передается он из JS при каждом подключении
    for param in query_params.split('&'):
        key, value = param.split('=')
        if key == 'user_id':
            user_id = value
            break
    print(user_id)
    
    use_case = UserConnectionStatusUseCase()
    use_case.set_data_about_connected_to_websocket_user(user_id, sid)
    update_user_connection_status_on_clients(user_id, True)
    print(f"User connected: SID={sid}, user_id={user_id}")


@sio.event()
def disconnect(sid):
    use_case = UserConnectionStatusUseCase()
    user_id = use_case.pop_data_about_connected_to_websocket_user(sid)
    update_user_connection_status_on_clients(user_id, use_case.is_user_has_websocket_connections(user_id))
    delete_peer(sid)
    print('disconnect ', sid, 'user_id', user_id)


def update_user_connection_status_on_clients(user_id: int, is_connected: bool) -> None:
    sio.emit('user_connection_status', {'user_id': user_id, 'is_connected': is_connected})


# Хранилище для RTCPeerConnection
peers = {}
relay = MediaRelay()

# Обработка подключения клиента
# Обработка отключения клиента
def delete_peer(sid):
    if sid in peers:
        peers[sid].close()
        del peers[sid]


# Обработка ICE-кандидатов
    