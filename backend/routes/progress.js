const express = require('express');
const Tutorial = require('../models/Tutorial');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');
const UserAchievement = require('../models/UserAchievement');
const { auth } = require('./auth');
const router = express.Router();

// XP rewards per difficulty
const XP_MAP = { beginner: 50, intermediate: 100, advanced: 200 };

// GET all progress for current user
router.get('/', auth, async (req, res) => {
  try {
    const progress = await UserProgress.find({ user: req.user.id })
      .populate('tutorial', 'title category difficulty')
      .sort('-createdAt');

    // Flatten for frontend compatibility
    const result = progress.map(p => ({
      _id: p._id,
      tutorial_id: p.tutorial?._id,
      title: p.tutorial?.title,
      category: p.tutorial?.category,
      difficulty: p.tutorial?.difficulty,
      completed: p.completed,
      current_step: p.current_step,
      completed_steps: p.completed_steps || [],
      total_steps: p.total_steps,
      xp_earned: p.xp_earned,
      notes: p.notes,
      createdAt: p.createdAt,
      completed_at: p.completed_at
    }));

    res.json(result);
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST start/update progress on a tutorial
router.post('/:tutorialId', auth, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.tutorialId);
    if (!tutorial) return res.status(404).json({ error: 'Tutorial not found' });

    const { current_step, completed, notes, completed_steps } = req.body;
    const totalSteps = (tutorial.steps || []).length;

    const updateFields = { total_steps: totalSteps };
    if (current_step !== undefined) updateFields.current_step = current_step;
    if (Array.isArray(completed_steps)) updateFields.completed_steps = completed_steps;
    if (notes !== undefined) updateFields.notes = notes;

    let isNewCompletion = false;
    if (completed) {
      const existing = await UserProgress.findOne({ user: req.user.id, tutorial: tutorial._id }).select('completed');
      if (!existing || !existing.completed) {
        updateFields.completed = true;
        updateFields.completed_at = new Date();
        const xp = XP_MAP[tutorial.difficulty] || 50;
        updateFields.xp_earned = xp;
        isNewCompletion = true;
      }
    }

    let progress = await UserProgress.findOneAndUpdate(
      { user: req.user.id, tutorial: tutorial._id },
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    if (isNewCompletion) {
      await User.findByIdAndUpdate(req.user.id, { $inc: { xp: updateFields.xp_earned } });
      await checkAchievements(req.user.id, tutorial);
    }

    // Update streak on any lesson activity
    const user = await User.findById(req.user.id).select('skill_level xp last_active streak_days');
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.last_active ? new Date(user.last_active).toISOString().split('T')[0] : null;
    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      user.streak_days = lastActive === yesterday ? user.streak_days + 1 : 1;
      user.last_active = new Date();
      await user.save();
    }

    // Get next tutorial suggestion
    let nextTutorial = null;
    if (progress.completed) {
      nextTutorial = await getNextTutorial(tutorial, req.user.id);
    }

    res.json({
      progress,
      nextTutorial,
      userLevel: user.skill_level,
      userXp: user.xp
    });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid tutorial ID' });
    console.error('Update progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET recommended tutorials
router.get('/recommended', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const completedProgress = await UserProgress.find({ user: req.user.id, completed: true }).select('tutorial');
    const completedIds = completedProgress.map(p => p.tutorial);

    let recommendedDifficulty = user.skill_level || 'beginner';
    if (recommendedDifficulty === 'undecided') recommendedDifficulty = 'beginner';

    // Check if all current-level tutorials are done
    const currentLevelCount = await Tutorial.countDocuments({ difficulty: recommendedDifficulty });
    const currentLevelDoneCount = await Tutorial.countDocuments({ difficulty: recommendedDifficulty, _id: { $in: completedIds } });
    const allCurrentDone = currentLevelCount > 0 && currentLevelDoneCount >= currentLevelCount;

    if (allCurrentDone) {
      if (recommendedDifficulty === 'beginner') recommendedDifficulty = 'intermediate';
      else if (recommendedDifficulty === 'intermediate') recommendedDifficulty = 'advanced';
    }

    // Sort by user's level first, then beginner→intermediate→advanced
    const diffOrder = { beginner: 1, intermediate: 2, advanced: 3 };
    const userDiffVal = diffOrder[recommendedDifficulty] || 1;

    const recommended = await Tutorial.aggregate([
      { $match: { _id: { $nin: completedIds } } },
      { $addFields: {
        diffVal: { $switch: {
          branches: [
            { case: { $eq: ['$difficulty', 'beginner'] }, then: 1 },
            { case: { $eq: ['$difficulty', 'intermediate'] }, then: 2 },
            { case: { $eq: ['$difficulty', 'advanced'] }, then: 3 },
          ],
          default: 4
        }},
        isUserLevel: { $cond: [{ $eq: ['$difficulty', recommendedDifficulty] }, 0, 1] }
      }},
      { $sort: { isUserLevel: 1, diffVal: 1, likes: -1 } },
      { $limit: 6 },
      { $project: { diffVal: 0, isUserLevel: 0 } }
    ]);

    res.json({ recommended, userLevel: recommendedDifficulty, allCurrentLevelDone: allCurrentDone });
  } catch (err) {
    console.error('Get recommended error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE cancel/remove a tutorial from progress
router.delete('/:tutorialId', auth, async (req, res) => {
  try {
    const result = await UserProgress.findOneAndDelete({ user: req.user.id, tutorial: req.params.tutorialId });
    if (!result) return res.status(404).json({ error: 'Progress not found' });
    res.json({ success: true });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid tutorial ID' });
    console.error('Delete progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

async function checkAchievements(userId, tutorial) {
  try {
    const completedCount = await UserProgress.countDocuments({ user: userId, completed: true });

    const milestones = [
      { count: 1, type: 'first_complete', title: 'First Steps', desc: 'Completed your first tutorial!' },
      { count: 5, type: 'five_complete', title: 'Getting Serious', desc: 'Completed 5 tutorials!' },
      { count: 10, type: 'ten_complete', title: 'Knowledge Seeker', desc: 'Completed 10 tutorials!' },
    ];

    for (const m of milestones) {
      if (completedCount >= m.count) {
        await UserAchievement.findOneAndUpdate(
          { user: userId, type: m.type },
          { user: userId, type: m.type, title: m.title, description: m.desc },
          { upsert: true }
        );
      }
    }

    // Category mastery
    const catCount = await UserProgress.countDocuments({
      user: userId,
      completed: true,
      tutorial: { $in: await Tutorial.find({ category: tutorial.category }).select('_id').then(t => t.map(x => x._id)) }
    });
    if (catCount >= 3) {
      const type = `master_${tutorial.category}`;
      await UserAchievement.findOneAndUpdate(
        { user: userId, type },
        { user: userId, type, title: `${tutorial.category.charAt(0).toUpperCase() + tutorial.category.slice(1)} Master`, description: `Completed 3+ ${tutorial.category} tutorials!` },
        { upsert: true }
      );
    }
  } catch (err) {
    console.error('Check achievements error:', err);
  }
}

async function getNextTutorial(completedTutorial, userId) {
  try {
    const completedProgress = await UserProgress.find({ user: userId, completed: true }).select('tutorial');
    const completedIds = completedProgress.map(p => p.tutorial);
    completedIds.push(completedTutorial._id);

    // Same category, next difficulty
    const next = await Tutorial.findOne({
      category: completedTutorial.category,
      _id: { $nin: completedIds }
    }).sort({ difficulty: 1 }).select('title difficulty category');

    if (next) return next;

    // Any category, prefer similar difficulty or next
    const diffOrder = { beginner: 0, intermediate: 1, advanced: 2 };
    const currentDiff = diffOrder[completedTutorial.difficulty] || 0;
    const nextDiffs = ['beginner', 'intermediate', 'advanced'].slice(currentDiff);

    for (const diff of nextDiffs) {
      const t = await Tutorial.findOne({
        difficulty: diff,
        _id: { $nin: completedIds }
      }).select('title difficulty category');
      if (t) return t;
    }

    return null;
  } catch {
    return null;
  }
}

module.exports = router;
