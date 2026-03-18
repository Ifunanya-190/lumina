const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
  completed: { type: Boolean, default: false },
  current_step: { type: Number, default: 0 },
  completed_steps: { type: [Number], default: [] },
  total_steps: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  xp_earned: { type: Number, default: 0 },
  completed_at: { type: Date, default: null },
}, { timestamps: true });

userProgressSchema.index({ user: 1, tutorial: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);
