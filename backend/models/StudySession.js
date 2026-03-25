const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', default: null },
  duration: { type: Number, required: true }, // in seconds
  type: { type: String, enum: ['pomodoro', 'free', 'tutorial'], default: 'pomodoro' },
}, { timestamps: true });

studySessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('StudySession', studySessionSchema);
