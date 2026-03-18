const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  display_name: { type: String, default: '' },
  skill_level: { type: String, enum: ['undecided', 'beginner', 'intermediate', 'advanced'], default: 'undecided' },
  xp: { type: Number, default: 0 },
  streak_days: { type: Number, default: 0 },
  last_active: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
