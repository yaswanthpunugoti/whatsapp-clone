// backend/scripts/processPayloads.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Message = require('../models/Message');

async function main(){
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB (processor)');

  const payloadDir = path.join(__dirname, '..', '..', 'payloads');
  if (!fs.existsSync(payloadDir)) {
    console.error('payloads directory not found:', payloadDir);
    process.exit(1);
  }

  const files = fs.readdirSync(payloadDir).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} payload files`);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(payloadDir, file), 'utf8');
    try {
      const payload = JSON.parse(raw);
      await processPayload(payload);
      console.log('Processed', file);
    } catch (e) {
      console.error('Failed to parse/process', file, e);
    }
  }

  console.log('All payloads processed');
  process.exit(0);
}

async function processPayload(payload){
  const entries = payload.entry || [];
  for (const entry of entries) {
    const changes = entry.changes || [];
    for (const change of changes) {
      const value = change.value || {};

      // messages (new inbound messages)
      if (Array.isArray(value.messages)) {
        for (const msg of value.messages) {
          const contacts = value.contacts || [];
          const contact = contacts[0] || {};
          const wa_id = (contact.wa_id) || msg.from || msg.to || 'unknown';
          const name = (contact.profile && contact.profile.name) || '';
          const text = msg?.text?.body || (msg.caption) || '';
          const ts = msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date();

          await Message.findOneAndUpdate(
            { msg_id: msg.id },
            {
              $setOnInsert: {
                msg_id: msg.id,
                meta_msg_id: msg?.context?.id || null,
                wa_id,
                name,
                direction: (msg.from === wa_id) ? 'inbound' : 'outbound',
                type: msg.type || 'text',
                text,
                timestamp: ts,
                status: 'received',
                raw: msg
              }
            },
            { upsert: true, new: true }
          );
        }
      }

      // statuses (delivered/read updates)
      if (Array.isArray(value.statuses)) {
        for (const st of value.statuses) {
          const id = st.id || st.message_id || st.msg_id || st.meta_msg_id;
          const status = st.status;
          if (!id) continue;
          const updated = await Message.findOneAndUpdate(
            { $or: [ { msg_id: id }, { meta_msg_id: id } ] },
            { $set: { status } },
            { new: true }
          );
          if (!updated) {
            console.log('Status update for unknown message id', id);
          }
        }
      }
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
