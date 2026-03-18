const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const UserAchievement = require('../models/UserAchievement');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'lumina-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

// Middleware to verify JWT token
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional auth
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), JWT_SECRET);
    } catch {}
  }
  next();
}

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    if (typeof username !== 'string' || username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const existing = await User.findOne({ $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }] });
    if (existing) {
      return res.status(409).json({ error: 'Username or email already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      display_name: display_name || username
    });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        skill_level: user.skill_level,
        xp: user.xp,
        streak_days: user.streak_days,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) {
      return res.status(400).json({ error: 'Login and password are required' });
    }

    const user = await User.findOne({ $or: [{ username: login.toLowerCase() }, { email: login.toLowerCase() }] });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last active & streak
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.last_active ? new Date(user.last_active).toISOString().split('T')[0] : null;
    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const newStreak = lastActive === yesterday ? user.streak_days + 1 : 1;
      user.last_active = new Date();
      user.streak_days = newStreak;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        skill_level: user.skill_level,
        xp: user.xp,
        streak_days: user.streak_days,
        last_active: user.last_active,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const completedCount = await UserProgress.countDocuments({ user: user._id, completed: true });
    const inProgressCount = await UserProgress.countDocuments({ user: user._id, completed: false });
    const xpAgg = await UserProgress.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, total: { $sum: '$xp_earned' } } }
    ]);
    const totalXp = xpAgg.length > 0 ? xpAgg[0].total : 0;
    const achievements = await UserAchievement.find({ user: user._id }).sort('-createdAt');

    res.json({
      ...user.toObject(),
      stats: { completedCount, inProgressCount, totalXp },
      achievements
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /me/skill-level
router.put('/me/skill-level', auth, async (req, res) => {
  try {
    const { skill_level } = req.body;
    if (!['beginner', 'intermediate', 'advanced'].includes(skill_level)) {
      return res.status(400).json({ error: 'Invalid skill level' });
    }

    await User.findByIdAndUpdate(req.user.id, { skill_level });

    // Award achievement for completing assessment
    await UserAchievement.findOneAndUpdate(
      { user: req.user.id, type: 'assessment_complete' },
      { user: req.user.id, type: 'assessment_complete', title: 'Path Chosen', description: `You chose the ${skill_level} learning path` },
      { upsert: true }
    );

    res.json({ skill_level, message: 'Skill level updated' });
  } catch (err) {
    console.error('Set skill level error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { router, auth, optionalAuth };
