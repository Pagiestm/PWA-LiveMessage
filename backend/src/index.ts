import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:4173"
    ],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

interface User {
  id: string;
  username: string;
}

const users: User[] = [];

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('join', (username: string) => {
    const user: User = {
      id: socket.id,
      username
    };
    users.push(user);
    socket.emit('welcome', `Welcome ${username}!`);
    socket.broadcast.emit('userJoined', `${username} joined the chat`);
  });

  socket.on('chatMessage', (message: string) => {
    const user = users.find(u => u.id === socket.id);
    if (user) {
      io.emit('message', {
        user: user.username,
        text: message,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  socket.on('disconnect', () => {
    const index = users.findIndex(u => u.id === socket.id);
    if (index !== -1) {
      const user = users[index];
      users.splice(index, 1);
      socket.broadcast.emit('userLeft', `${user.username} left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});