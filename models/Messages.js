const mongoose = require("mongoose");

const { Schema } = mongoose;

const MessageSchema = new Schema({
  author: String,
  date: String,
  text: String,
  type: String
});

const MessagesSchema = new Schema({
  userName: String,
  messages: [MessageSchema],
}, { collection: 'Messages' });

module.exports = mongoose.model('Messages', MessagesSchema);
