// backend/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  msg_id: { type: String, index: true, unique: true, sparse: true }, // unique for messages with id
  meta_msg_id: { type: String, index: true, sparse: true },
  wa_id: { type: String, required: true }, // phone number (conversation owner)
  name: String, // contact name
  number: String,
  direction: { type: String, enum: ['inbound', 'outbound'], default: 'inbound' },
  type: String, // text, image, etc
  text: String,
  timestamp: Date,
  status: String, // sent, delivered, read
  raw: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
