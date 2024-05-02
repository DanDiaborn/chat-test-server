const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");

const Chats = require("./models/Chats");
const Messages = require("./models/Messages");

const app = express();
const PORT = process.env.PORT || 3001;

const io = require('socket.io')(process.env.PORT || 3000, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "https://your-render-app.onrender.com"]
  }
});

const messages = [
  { id: 1, author: 'user1', text: 'User first message', type: 'User' },
  { id: 2, author: 'operator', text: 'Operator first message', type: 'Operator' },
  { id: 3, author: 'operator', text: 'Operator server message', type: 'Operator' }
];

const start = async () => {
  try {
    app.use(cors());
    app.use(express.json());
    await mongoose.connect("mongodb+srv://DanSher:tziO4kvuG0lQIvoN@cluster0.c9ughq4.mongodb.net/".concat("test-chat"));

    app.get("/", (req, res) => {
      res.json(messages);
    });

    app.get("/chats", (req, res) => {
      console.log(123);
      Chats.find().then(result => {
        res.json(result);
      });
    });

    io.on('connection', (socket) => {
      console.log('User connected', socket.id);

      socket.on('getChats', async () => {
        await Chats.find().then(result => {
          socket.emit('getChats', result);
        });
      });

      socket.on('joinChat', async (roomId) => {
        await Chats.find({ userName: roomId }).then(result => {
          if (result[0] == null) {
            let newChat = new Chats({
              userName: roomId
            });
            newChat.save();

            let newMessages = new Messages({
              userName: roomId,
              messages: []
            });
            newMessages.save();
            Chats.find().then(result => {
              console.log(result);
              socket.broadcast.emit('getChats', result);
            });
          }
        });

        socket.join(roomId);
        Messages.find({ userName: roomId }).then(result => {
          io.to(roomId).emit('messages', result);
        });
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      socket.on('sendMessage', async (roomId, message, type, author) => {
        let oldMessages = 'placeholder';
        await Messages.find({ userName: roomId }).then(result => { oldMessages = result; });
        oldMessages[0].messages.push({
          author: author,
          date: 132,
          text: message,
          type: type
        });
        await Messages.updateOne({ userName: roomId }, { $set: { messages: oldMessages[0].messages } });
        Messages.find({ userName: roomId }).then(result => { io.to(roomId).emit('messages', result); });

        console.log(`Message "${message}" sent to room ${roomId}`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });

    app.listen(PORT, () => {
      console.log('Server started');
    });
  }
  catch (e) {
    console.log(e);
  }
};

start();
