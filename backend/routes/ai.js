const express = require('express');
const ChatHistory = require('../models/ChatHistory');
const Tutorial = require('../models/Tutorial');
const User = require('../models/User');
const { auth, optionalAuth } = require('./auth');
const router = express.Router();

let genAI = null;
let model = null;
const MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];
let activeModelName = '';

// Initialize Gemini if API key is available
function initGemini() {
  const apiKey = (process.env.GEMINI_API_KEY || '').replace(/^['"]|['"]$/g, '').trim();
  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      genAI = new GoogleGenerativeAI(apiKey);
      activeModelName = MODEL_CHAIN[0];
      model = genAI.getGenerativeModel({ model: activeModelName });
      console.log(`Gemini AI initialized with model: ${activeModelName}`);
      return true;
    } catch (err) {
      console.error('Failed to initialize Gemini:', err.message);
      return false;
    }
  }
  console.log('No Gemini API key found. AI features will use fallback mode.');
  return false;
}

// Timeout wrapper
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('AI request timed out')), ms))
  ]);
}

// Retry helper — retries with short waits to let rate limits clear
async function aiGenerate(fn, timeoutMs = 20000) {
  const errors = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const modelName of MODEL_CHAIN) {
      try {
        const currentModel = genAI.getGenerativeModel({ model: modelName });
        const result = await withTimeout(fn(currentModel), timeoutMs);
        if (modelName !== activeModelName) {
          activeModelName = modelName;
          model = currentModel;
        }
        return result;
      } catch (err) {
        const is429 = err.message && err.message.includes('429');
        const isTimeout = err.message?.includes('timed out');
        console.error(`AI attempt ${attempt + 1} with ${modelName}:`, err.message?.substring(0, 150));
        errors.push(`${modelName}: ${err.message?.substring(0, 80)}`);
        if (!is429 && !isTimeout) throw err;
      }
    }
    // Wait before retrying all models again
    if (attempt < 1) {
      console.log('All models rate-limited. Waiting 8s before retry...');
      await new Promise(r => setTimeout(r, 8000));
    }
  }
  throw new Error('AI rate limited — all models are temporarily unavailable. Please wait a minute and try again.');
}

const SYSTEM_PROMPT = `You are Lumina, an AI learning mentor created by Ifunanya Ezeogu. You are warm, encouraging, knowledgeable, and slightly playful.
You were built as part of the Lumina learning platform — if anyone asks who made you or who created you, proudly say you were created by Ifunanya Ezeogu.
You help people learn new skills and hobbies. You can:
- Explain any concept in simple, clear terms
- Suggest learning paths and next steps
- Generate practice exercises
- Motivate and encourage learners
- Answer questions about any tutorial topic

Keep responses concise but helpful (2-4 paragraphs max). Use markdown formatting.
Always be positive and encouraging. If someone is struggling, remind them that learning takes time.
End responses with a helpful suggestion or question to keep the conversation going.
When someone greets you (hello, hi, hey, etc.), greet them warmly by their name if provided.`;

// POST chat with AI mentor
router.post('/chat', auth, async (req, res) => {
  const { message, context } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const userId = req.user.id;

  // Look up the user's display name from the database
  const dbUser = await User.findById(userId).select('display_name username');
  const displayName = dbUser?.display_name || dbUser?.username || '';

  await ChatHistory.create({ user: userId, role: 'user', content: message, context: context || null });

  try {
    let reply;

    if (genAI) {
      const history = await ChatHistory.find({ user: userId }).sort('-createdAt').limit(11);
      const ordered = history.reverse();

      let chatHistory = ordered.slice(0, -1).map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }));

      while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
        chatHistory.shift();
      }

      let systemText = SYSTEM_PROMPT;
      if (displayName) systemText += `\n\nThe user's name is ${displayName}. Address them by name when greeting.`;
      if (context) systemText += `\n\nCurrent context: The user is viewing: ${context}`;

      const result = await aiGenerate(async (currentModel) => {
        const chat = currentModel.startChat({
          history: chatHistory,
          systemInstruction: { role: 'user', parts: [{ text: systemText }] },
        });
        return chat.sendMessage(message);
      });

      reply = result.response.text();
    } else {
      reply = getFallbackResponse(message);
    }

    await ChatHistory.create({ user: userId, role: 'assistant', content: reply });

    res.json({ reply, ai_powered: !!genAI });
  } catch (err) {
    console.error('AI chat error:', err.message);
    const reply = `**Lumina is temporarily busy** — The AI is rate-limited right now.\n\nPlease wait about 30-60 seconds and try again. Your question was great, I just need a moment!\n\n_Error: ${err.message?.substring(0, 100)}_`;
    await ChatHistory.create({ user: userId, role: 'assistant', content: reply });
    res.json({ reply, ai_powered: false, rate_limited: true });
  }
});

// POST generate a tutorial with AI
router.post('/generate-tutorial', async (req, res) => {
  const { topic, difficulty } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const safeDifficulty = ['beginner', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : 'beginner';

  try {
    let tutorialData;

    if (genAI) {
      const prompt = `You are an expert instructor. Generate a DETAILED, REAL tutorial about "${topic}" at ${safeDifficulty} level.

IMPORTANT RULES:
- Every step must contain SPECIFIC, ACTIONABLE instructions for "${topic}" — NOT generic filler like "research the basics" or "gather materials"
- The content section must be a THOROUGH guide with real techniques, tips, and detailed explanations specific to "${topic}"
- Include actual facts, techniques, safety tips, common mistakes, and expert advice about "${topic}"
- Steps should walk the learner through the actual process of doing/learning "${topic}" step by step
- Content must be at least 6-8 paragraphs with specific details, not vague encouragement
- Duration should reflect realistic time needed

Return ONLY valid JSON (no markdown code fences) in this exact format:
{
  "title": "A catchy, specific title about ${topic}",
  "description": "A compelling 1-2 sentence description with specific details about what the learner will achieve",
  "category": "one of: cooking, crafts, fitness, music, art, games, technology, science, language, lifestyle",
  "difficulty": "${safeDifficulty}",
  "duration": "realistic estimated time",
  "content": "Full detailed markdown tutorial with ## headers, real techniques, specific instructions, tips, safety notes, common mistakes — at least 6 paragraphs of REAL content about ${topic}",
  "steps": ["each step must be a SPECIFIC action for ${topic}, not generic — at least 7 steps"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

      const result = await aiGenerate(async (currentModel) => {
        return currentModel.generateContent(prompt);
      });
      const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      tutorialData = JSON.parse(text);
    } else {
      tutorialData = getFallbackTutorial(topic, safeDifficulty);
    }

    const saved = await Tutorial.create({
      title: tutorialData.title,
      description: tutorialData.description,
      category: tutorialData.category,
      difficulty: tutorialData.difficulty || safeDifficulty,
      duration: tutorialData.duration,
      content: tutorialData.content,
      steps: tutorialData.steps,
      tags: tutorialData.tags,
      ai_generated: true
    });

    res.json({
      ...saved.toObject(),
      ai_powered: !!genAI
    });
  } catch (err) {
    console.error('Tutorial generation error:', err);
    res.status(503).json({ error: 'AI is temporarily rate-limited. Please wait about a minute and try again.', details: err.message?.substring(0, 100) });
  }
});

// POST explain a concept
router.post('/explain', async (req, res) => {
  const { text, tutorialTitle } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text to explain is required' });
  }

  try {
    let explanation;

    if (genAI) {
      const prompt = `The user is reading a tutorial called "${tutorialTitle || 'unknown'}" and wants you to explain this concept:\n\n"${text}"\n\nGive a clear, detailed explanation (2-3 paragraphs). Include specific facts, real-world examples, and practical tips. Use analogies if helpful. Format with markdown.`;
      const result = await aiGenerate(async (currentModel) => {
        return currentModel.generateContent(prompt);
      });
      explanation = result.response.text();
    } else {
      explanation = `**Great question!**\n\nThis concept is about understanding "${text.substring(0, 100)}..." in a deeper way. Think of it like building blocks — each piece of knowledge connects to the next.\n\nThe key here is practice and repetition. Don't worry if it doesn't click right away — that's completely normal! Try breaking it down into smaller parts and tackling each one individually.\n\n*Keep exploring and asking questions — that's how real learning happens!*`;
    }

    res.json({ explanation, ai_powered: !!genAI });
  } catch (err) {
    console.error('Explain error:', err.message);
    res.status(503).json({
      explanation: `**Lumina is temporarily busy** \u2014 The AI is rate-limited right now. Please wait about 30-60 seconds and try again.`,
      ai_powered: false,
      rate_limited: true
    });
  }
});

// GET chat history
router.get('/history', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const history = await ChatHistory.find({ user: req.user.id }).sort('-createdAt').limit(limit);
    res.json(history.reverse());
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE clear chat history
router.delete('/history', auth, async (req, res) => {
  try {
    await ChatHistory.deleteMany({ user: req.user.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET AI status
router.get('/status', (req, res) => {
  res.json({
    ai_available: !!genAI,
    model: genAI ? activeModelName : 'fallback',
    message: genAI ? 'Lumina AI is online and ready' : 'Running in demo mode'
  });
});

// Fallback responses
function getFallbackResponse(message) {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `**Hey there!** Welcome to Lumina!\n\nI'm your AI learning mentor. I'm here to help you discover new skills, guide you through tutorials, and answer any questions you have.\n\nWhat would you like to learn today? You can ask me about any of our tutorials, or tell me a skill you're curious about and I can generate a custom tutorial just for you!`;
  }

  if (lower.includes('tutorial') || lower.includes('learn') || lower.includes('teach')) {
    return `**I'd love to help you learn!**\n\nWe have tutorials in several categories:\n- **Art & Crafts** — Origami, watercolor painting\n- **Cooking** — Quick recipes and techniques\n- **Fitness** — Yoga and workout routines\n- **Music** — Guitar and instrument basics\n- **Games** — Chess strategies and more\n\nYou can also ask me to **generate a custom tutorial** on literally any topic! Just say something like "Create a tutorial about [topic]".\n\nWhat catches your interest?`;
  }

  if (lower.includes('create') || lower.includes('generate') || lower.includes('make')) {
    return `**Great idea!**\n\nI can generate custom tutorials on almost any topic! To get the best results, try the **AI Lab** page where you can:\n- Choose a topic\n- Set the difficulty level\n- Get a full tutorial generated instantly\n\nThe tutorial will include step-by-step instructions, tips, and all the details you need to get started.\n\n*What would you like to learn?*`;
  }

  return `**That's a great question!**\n\nI'm Lumina, your learning companion. Here are some things I can help with:\n- Browse and search tutorials\n- Get personalized learning suggestions\n- Generate custom tutorials in the AI Lab\n- Explain concepts from any tutorial\n\n*What would you like to explore?*`;
}

function getFallbackTutorial(topic, difficulty) {
  return {
    title: `Getting Started with ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
    description: `A comprehensive ${difficulty}-level guide to ${topic}. Learn the fundamentals and start your journey today.`,
    category: 'lifestyle',
    difficulty: difficulty,
    duration: '15 min',
    content: `# Introduction to ${topic}\n\nWelcome to your journey into ${topic}! This tutorial will guide you through the essentials.\n\n## Why Learn ${topic}?\n${topic} is a valuable skill that can enrich your life in many ways. Whether you're doing it for fun, personal growth, or professional development, you're making a great choice.\n\n## What You'll Need\n- An open mind and willingness to learn\n- Basic materials related to ${topic}\n- About 15 minutes of focused time\n- A notebook to jot down your thoughts\n\n## Getting Started\nThe best way to learn ${topic} is to dive right in. Don't worry about being perfect — focus on understanding the basics first, and refinement will come with practice.\n\n## Tips for Success\n- Start small and build gradually\n- Practice consistently, even if just for a few minutes\n- Don't compare yourself to experts\n- Celebrate small wins along the way`,
    steps: [
      `Research and understand the basics of ${topic}`,
      'Gather all necessary materials and tools',
      'Start with the simplest fundamental technique',
      'Practice the technique for 5-10 minutes',
      'Review what you learned and identify areas to improve',
      'Try a slightly more advanced variation',
      'Document your progress and observations'
    ],
    tags: [topic.toLowerCase(), difficulty, 'learning', 'skills', 'tutorial']
  };
}

module.exports = { router, initGemini };
