require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./database');
const seed = require('./seed');
const tutorialRoutes = require('./routes/tutorials');
const { router: aiRoutes, initGemini } = require('./routes/ai');
const progressRoutes = require('./routes/progress');
const { router: authRoutes } = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : true;

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10mb' }));

// Static files for tutorial images
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Lumina Backend', version: '2.0.0' });
});

// Initialize
async function start() {
  await connectDB();
  await seed();
  initGemini();

  app.listen(PORT, () => {
    console.log(`\n✨ Lumina Backend running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
