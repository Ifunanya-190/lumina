const mongoose = require('mongoose');

const tutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  duration: { type: String, default: '10 min' },
  thumbnail: { type: String, default: '' },
  content: { type: String, required: true },
  steps: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  ai_generated: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Tutorial', tutorialSchema);
