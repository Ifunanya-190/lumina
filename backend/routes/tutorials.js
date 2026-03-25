const express = require('express');
const Tutorial = require('../models/Tutorial');
const UserFavorite = require('../models/UserFavorite');
const { auth, optionalAuth } = require('./auth');
const router = express.Router();

// GET all tutorials with optional filters — NO level filtering
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, limit } = req.query;
    const filter = {};

    if (category && category !== 'all') filter.category = category;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { title: regex },
        { description: regex },
        { tags: regex }
      ];
    }

    let query = Tutorial.find(filter).sort('-createdAt');
    if (limit) query = query.limit(parseInt(limit, 10));

    const tutorials = await query;
    res.json(tutorials);
  } catch (err) {
    console.error('Get tutorials error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET categories with counts
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Tutorial.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET stats
router.get('/meta/stats', async (req, res) => {
  try {
    const stats = await Tutorial.aggregate([
      {
        $group: {
          _id: null,
          totalTutorials: { $sum: 1 },
          totalCategories: { $addToSet: '$category' },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' }
        }
      },
      {
        $project: {
          _id: 0,
          totalTutorials: 1,
          totalCategories: { $size: '$totalCategories' },
          totalViews: 1,
          totalLikes: 1
        }
      }
    ]);
    res.json(stats[0] || { totalTutorials: 0, totalCategories: 0, totalViews: 0, totalLikes: 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET user's favorites (must be before /:id)
router.get('/favorites', auth, async (req, res) => {
  try {
    const favs = await UserFavorite.find({ user: req.user.id }).populate('tutorial').sort('-createdAt');
    const tutorials = favs.filter(f => f.tutorial).map(f => f.tutorial);
    res.json(tutorials);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single tutorial
router.get('/:id', async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ error: 'Tutorial not found' });

    // Increment views
    tutorial.views += 1;
    await tutorial.save();

    res.json(tutorial);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST like a tutorial
router.post('/:id/like', auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!tutorial) return res.status(404).json({ error: 'Tutorial not found' });
    res.json({ likes: tutorial.likes });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE an AI-generated tutorial
router.delete('/:id', auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) return res.status(404).json({ error: 'Tutorial not found' });
    await tutorial.deleteOne();
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID' });
    res.status(500).json({ error: 'Server error' });
  }
});

// POST toggle favorite
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const tutorialId = req.params.id;
    const existing = await UserFavorite.findOne({ user: req.user.id, tutorial: tutorialId });

    if (existing) {
      await existing.deleteOne();
      res.json({ favorited: false, tutorial_id: tutorialId });
    } else {
      await UserFavorite.create({ user: req.user.id, tutorial: tutorialId });
      const tutorial = await Tutorial.findById(tutorialId).select('title description category difficulty duration');
      res.json({ favorited: true, tutorial_id: tutorialId, tutorial });
    }
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID' });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
