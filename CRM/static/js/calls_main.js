function connect_to_socket() {
    const socket = io('http://127.0.0.1:5001', {'transports': ['websocket']});
    socket.on('connect', () => {
        console.log('connected');
        window.sessionStorage.setItem('sid', socket.id);
        socket.emit('set_user_connected_status', {'user_id': user_id, 'is_connected': true});
    })
}

connect_to_socket();

function set_user_connection_status_to_page(id, is_connected) {
    status_label = document.getElementsByClassName('user-status-' + id);
    if (is_connected) {
        status_label[0].innerHTML = 'Online';
        status_label[0].style.color = 'green';
    } else {
        status_label[0].innerHTML = 'Offline';
        status_label[0].style.color = 'red';
    }
}

function listen_socket() {
    const socket = io('http://127.0.0.1:5001', {'transports': ['websocket']});
    socket.on('user_connection_status', (data) => {
        set_user_connection_status_to_page(data['user_id'], data['is_connected']);
        console.log(data);
    })        
}

listen_socket();