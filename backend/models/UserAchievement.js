const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

userAchievementSchema.index({ user: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('UserAchievement', userAchievementSchema);
