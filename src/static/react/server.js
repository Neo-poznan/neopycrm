const path = require('path');
const express = require('express');
const ACTIONS = require('./src/socket/actions');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const {version, validate} = require('uuid');
const redis = require('redis');

const PORT = 5001

const redisClient = redis.createClient({
    url: 'redis://127.0.0.1:6379'
  })

redisClient.connect();

function getClientRooms() {
    const {rooms} = io.sockets.adapter;
    return Array.from(rooms.keys()).filter(roomID => validate(roomID) && version(roomID) === 4);
}

function shareRoomsInfo() {
    io.emit(ACTIONS.SHARE_ROOMS, {
        rooms: getClientRooms()
    })
    console.log('список комнат расшарен');
    console.log(getClientRooms());
}

io.on('connection', socket => {
    console.log('socket connected!');
    shareRoomsInfo();
    socket.on(ACTIONS.JOIN, config => {
        const {room: roomID} = config;
        const {rooms: joinedRooms} = socket;
        console.log('join room');

        if (Array.from(joinedRooms).includes(roomID)) {
            return console.warn(`Already joined to ${roomID}`);
        }

        const clients  = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

        clients.forEach(clientID => {
            io.to(clientID).emit(ACTIONS.ADD_PEER, {
                peerID: socket.id,
                createOffer: false
            });


            socket.emit(ACTIONS.ADD_PEER, {
                peerID: clientID,
                createOffer: true
            })
        });
        socket.join(roomID);
        shareRoomsInfo();
    });


    // socket.on(ACTIONS.LEAVE, leaveRoom);
    socket.on('disconnect', () => {
        console.log(socket.id);
        io.emit(ACTIONS.REMOVE_PEER, {
            peerID: socket.id,
        });
    });

    socket.on(ACTIONS.RELAY_SDP, ({peerID, sessionDescription}) => {
        console.log('отправлен sdp');
        io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerID: socket.id,
            sessionDescription
        });
    });
    socket.on(ACTIONS.RELAY_ICE, ({peerID, iceCandidate}) => {
        io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
            peerID: socket.id,
            iceCandidate,
        });
    });
    socket.on(ACTIONS.FIX_VIDEO, (data) => {
        if ( ! data.fixedPeer ) {
            console.log('Fixed self: ', socket.id);
            redisClient.set('fixed_peer', socket.id);
            io.emit(ACTIONS.FIX_VIDEO, { fixedPeer: socket.id });
        }
        else {
            console.log('Fixed other: ', data.fixedPeer);
            redisClient.set('fixed_peer', data.fixedPeer);
            io.emit(ACTIONS.FIX_VIDEO, {fixedPeer: data.fixedPeer})
        }
    })
    socket.on(ACTIONS.TOGGLE_CAMERA, (data) => {

        io.emit(ACTIONS.TOGGLE_CAMERA, { 
            peerID: socket.id,
            isOn: data.isOn
        });

    })
});

server.listen( PORT, () => {
    console.log('server started!');
});
