const mongoose = require("mongoose");

const { Schema } = mongoose;

const ChatsSchema = new Schema({
  userName: String,
}, { collection: 'Chats' });

module.exports = mongoose.model('Chats', ChatsSchema);
