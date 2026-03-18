const mongoose = require('mongoose');

const userFavoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true },
}, { timestamps: true });

userFavoriteSchema.index({ user: 1, tutorial: 1 }, { unique: true });

module.exports = mongoose.model('UserFavorite', userFavoriteSchema);
