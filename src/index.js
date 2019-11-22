const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage, capitalize } = require('./utils/messages');  
const { addUser, removeUser, getUser, getUsersInRoom }  = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', socket => {
  console.log('a user connected');

  socket.on('join', (options, callback)=>{

   const { error, user} = addUser({id: socket.id, ...options})

    if(error){
      return callback(error)
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Admin',`Welcome, ${capitalize(user.username)}!`))
    socket.broadcast.to(user.room).emit('message', generateMessage(`${capitalize(user.username)} has joined!`));
    
    
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    callback();
  })


  socket.on('sendMessage', (msg, callback) => {
    const filter = new Filter();

    const user = getUser(socket.id)

    if(filter.isProfane(msg)){
      return callback('Profanity is not allowed!')
    }

    io.to(user.room).emit('message', generateMessage(capitalize(user.username), msg));
    callback()
  });

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)

    io.to(user.room).emit('locationMessage', generateLocationMessage(capitalize(user.username), `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if(user){
      io.to(user.room).emit('message', generateMessage('Admin', `${capitalize(user.username)} has left`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  
  })
});

server.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
