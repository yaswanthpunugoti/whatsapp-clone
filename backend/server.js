// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

/**
 * GET /api/conversations
 * Returns list of conversations grouped by wa_id with lastMessage and total count
 */
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: "$wa_id",
          lastMessage: { $first: "$$ROOT" },
          total: { $sum: 1 }
      }},
      { $project: { wa_id: "$_id", lastMessage: 1, total:1, _id:0 } },
      { $sort: { "lastMessage.timestamp": -1 } }
    ]);
    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/conversations/:wa_id/messages
 * Returns messages for a conversation sorted ascending by timestamp
 */
app.get('/api/conversations/:wa_id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ wa_id: req.params.wa_id }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/conversations/:wa_id/messages
 * Demo "send message": store a new outbound message in DB (not sending to WhatsApp)
 */
app.post('/api/conversations/:wa_id/messages', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });

    const newMsg = new Message({
      msg_id: `local_${Date.now()}`, // synthetic id
      wa_id: req.params.wa_id,
      name: 'You',
      direction: 'outbound',
      type: 'text',
      text,
      timestamp: new Date(),
      status: 'sent',
      raw: {}
    });

    await newMsg.save();
    return res.status(201).json(newMsg);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, ()=> console.log(`Server listening on port ${PORT}`));
