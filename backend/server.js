require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const connectDB = require('./database');
const seed = require('./seed');
const tutorialRoutes = require('./routes/tutorials');
const { router: aiRoutes, initGemini } = require('./routes/ai');
const progressRoutes = require('./routes/progress');
const { router: authRoutes } = require('./routes/auth');
const User = require('./models/User');
const ChatHistory = require('./models/ChatHistory');

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

  // One-time cleanup: remove any internal feature messages from chat history
  const INTERNAL_CONTEXTS = ['dream_builder', 'practice_simulator', 'practice_evaluator', 'journey_generator', 'journey_coach'];
  ChatHistory.deleteMany({ context: { $in: INTERNAL_CONTEXTS } }).then(r => {
    if (r.deletedCount > 0) console.log(`Cleaned ${r.deletedCount} internal messages from chat history`);
  }).catch(() => {});

  app.listen(PORT, () => {
    console.log(`\n✨ Lumina Backend running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);

    // Streak reminder cron — runs daily at 8 PM
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: smtpUser, pass: smtpPass },
      });
      const fromEmail = process.env.SMTP_FROM || smtpUser;

      cron.schedule('0 20 * * *', async () => {
        try {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const startOfYesterday = new Date(yesterday.toISOString().split('T')[0]);
          const endOfYesterday = new Date(startOfYesterday);
          endOfYesterday.setDate(endOfYesterday.getDate() + 1);

          // Users active yesterday but not today — their streak is at risk
          const atRisk = await User.find({
            last_active: { $gte: startOfYesterday, $lt: endOfYesterday },
            streak_days: { $gte: 2 },
          }).select('email display_name username streak_days');

          for (const u of atRisk) {
            const name = u.display_name || u.username;
            await transporter.sendMail({
              from: fromEmail,
              to: u.email,
              subject: `🔥 Your ${u.streak_days}-day streak is about to end!`,
              html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0B0D14;color:#F0EBE3;border-radius:16px;">
                <h1 style="color:#E8A84C;margin:0 0 12px;">Hey ${name}!</h1>
                <p style="line-height:1.6;">Your <strong style="color:#E8A84C;">${u.streak_days}-day</strong> learning streak is about to expire. Don't let it slip!</p>
                <p style="line-height:1.6;">Log in and complete any activity today to keep your streak alive. 🔥</p>
                <p style="margin-top:24px;color:#CEC7BC;font-size:13px;">— Lumina Learning</p>
              </div>`,
            }).catch(err => console.error(`Streak email failed for ${u.email}:`, err.message));
          }
          if (atRisk.length > 0) console.log(`Streak reminders sent to ${atRisk.length} users`);
        } catch (err) {
          console.error('Streak reminder cron error:', err.message);
        }
      });
      console.log('📧 Streak reminder emails enabled (daily at 8 PM)');
    }

    // Self-ping every 14 minutes to prevent Render free tier from sleeping
    if (process.env.RENDER_EXTERNAL_URL) {
      const https = require('https');
      setInterval(() => {
        https.get(`${process.env.RENDER_EXTERNAL_URL}/api/health`, (res) => {
          console.log(`Keep-alive ping: ${res.statusCode}`);
        }).on('error', () => {});
      }, 14 * 60 * 1000);
      console.log('Keep-alive ping enabled (every 14 min)');
    }
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
