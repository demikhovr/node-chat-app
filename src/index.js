const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const Filter = require('bad-words');
const { generateLocationMessage, generateMessage } = require('./utils/messages');
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require('./utils/users');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '../public');
const SYSTEM_USER = 'Server';

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(PUBLIC_DIR));

io.on('connection', (socket) => {
  socket.on('join', ({ room, username }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      room,
      username,
    });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit('message', generateMessage(SYSTEM_USER, 'Welcome!'));
    socket.broadcast.to(user.room).emit('message', generateMessage(SYSTEM_USER, `${user.username} has joined!`));
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    return callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    const user = getUser(socket.id);
    io.to(user.room).emit('message', generateMessage(user.username, message));
    return callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, coords));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage(SYSTEM_USER, `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server is up on port ${PORT}`));
