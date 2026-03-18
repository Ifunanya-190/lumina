const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  role: { type: String, required: true },
  content: { type: String, required: true },
  context: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
