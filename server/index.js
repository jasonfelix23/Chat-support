//Libraries
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors'); // Import cors module
const mongoose = require('mongoose');


//Custom imports
const Room = require('./models/Room');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');
const router = require('./router');


//port 
const PORT = process.env.PORT || 5000;


const app = express();
const server = http.createServer(app);

app.use(cors());

//connect to mongoDB
mongoose.connect('mongodb://localhost:27017/Rooms', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// After connecting to MongoDB
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
    }
});

io.on('connection', (socket) => {
    console.log(`We have a new connection ${socket.id}`);

    socket.on('join', ({ name, room }, callback) => {
        console.log(`${name} has joined room ${room}`);

        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        socket.join(user.room);

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!` });

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) })
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        console.log(`from SendMessage ${user.name}`);

        io.to(user.room).emit('message', { user: user.name, text: message });
        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    })

    socket.on('draw-line', ({ prevPoint, currentPoint, color }) => {
        const user = getUser(socket.id);

        socket.broadcast.to(user.room).emit('draw-line', { prevPoint, currentPoint, color });
    })

    socket.on('clear', () => {
        const user = getUser(socket.id);
        io.to(user.room).emit('clear')
    }
    );

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
        }
    });
});

app.use(express.json());
app.use(router);

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
