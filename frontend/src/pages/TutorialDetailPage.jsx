import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../context/AppContext';
import { FaClock, FaArrowLeft, FaHeart, FaBrain, FaCheckCircle, FaCircle, FaLightbulb, FaArrowRight, FaTrophy, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import TypingMessage from '../components/TypingMessage';

const diffGradient = {
  beginner: 'from-aurora-green to-emerald-400',
  intermediate: 'from-aurora-cyan via-aurora-blue to-aurora-pink',
  advanced: 'from-aurora-pink to-red-400',
};

const TutorialDetailPage = () => {
  const { id } = useParams();
  const { explainConcept, likeTutorial, setChatOpen, API, isLoggedIn, updateProgress, requireAuth, toggleFavorite, isFavorited, userProgress } = useApp();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [nextTutorial, setNextTutorial] = useState(null);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  useEffect(() => {
    axios.get(`${API}/tutorials/${id}`)
      .then(r => setTutorial(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, API]);

  // Restore saved progress when tutorial loads
  useEffect(() => {
    if (!tutorial || !isLoggedIn || !userProgress.length) return;
    const saved = userProgress.find(p => p.tutorial_id === tutorial._id);
    if (saved) {
      if (Array.isArray(saved.completed_steps) && saved.completed_steps.length > 0) {
        setCompletedSteps(new Set(saved.completed_steps));
      } else if (saved.current_step > 0) {
        const restored = new Set();
        for (let i = 0; i < saved.current_step; i++) restored.add(i);
        setCompletedSteps(restored);
      }
      if (saved.completed) setTutorialCompleted(true);
    }
  }, [tutorial, isLoggedIn, userProgress]);

  const toggleStep = (i) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);

      // Save progress if logged in
      if (isLoggedIn && tutorial) {
        const allDone = next.size === tutorial.steps.length && tutorial.steps.length > 0;
        updateProgress(tutorial._id, {
          current_step: next.size,
          completed_steps: [...next],
          completed: allDone,
        }).then(data => {
          if (data.nextTutorial) setNextTutorial(data.nextTutorial);
          if (allDone) setTutorialCompleted(true);
        }).catch(() => {});
      }

      return next;
    });
  };

  const handleExplain = async (text) => {
    if (!requireAuth('use the concept explainer')) return;
    setExplaining(true);
    setExplanation(null);
    try {
      const data = await explainConcept(text, tutorial?.title);
      setExplanation(data.explanation);
    } catch (err) {
      const msg = err.response?.data?.explanation || 'AI is temporarily busy. Please wait a moment and try again.';
      setExplanation(msg);
    }
    setExplaining(false);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="shimmer h-8 w-48 rounded-lg" />
      <div className="shimmer h-64 rounded-2xl" />
      <div className="shimmer h-40 rounded-2xl" />
    </div>
  );

  if (!tutorial) return (
    <div className="text-center py-20">
      <p className="text-white/40 text-lg">Tutorial not found</p>
      <Link to="/tutorials" className="text-aurora-cyan hover:underline mt-4 inline-block">Back to tutorials</Link>
    </div>
  );

  const progress = tutorial.steps.length > 0 ? Math.round((completedSteps.size / tutorial.steps.length) * 100) : 0;
  const grad = diffGradient[tutorial.difficulty] || diffGradient.beginner;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link to="/tutorials" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-aurora-cyan transition-colors mb-6">
        <FaArrowLeft className="text-xs" /> Back to tutorials
      </Link>

      {/* Header card */}
      <div className="glass rounded-2xl overflow-hidden mb-8">
        <div className={`h-2 bg-gradient-to-r ${grad}`} />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase bg-gradient-to-r ${grad} text-nebula-900`}>
              {tutorial.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/50">
              {tutorial.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{tutorial.title}</h1>
          <p className="text-white/50 text-lg leading-relaxed mb-6">{tutorial.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-white/30">
            <span className="flex items-center gap-1.5"><FaClock className="text-aurora-cyan" /> {tutorial.duration}</span>
            <span className="flex items-center gap-1.5"><FaHeart className="text-aurora-pink" /> {tutorial.likes} likes</span>
            {tutorial.tags && tutorial.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tutorial.tags.slice(0, 4).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-white/30">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content - left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Steps */}
          {tutorial.steps.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Steps</h2>
                <span className="text-xs text-aurora-cyan">{progress}% complete</span>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/5 mb-5">
                <div className={`h-full rounded-full bg-gradient-to-r ${grad} transition-all duration-500`} style={{ width: `${progress}%` }} />
              </div>

              <div className="space-y-3">
                {tutorial.steps.map((step, i) => {
                  const done = completedSteps.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleStep(i)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-300 ${
                        done ? 'bg-aurora-green/5 border border-aurora-green/20' : 'bg-white/[0.02] border border-white/5 hover:bg-white/5'
                      }`}
                    >
                      {done ? (
                        <FaCheckCircle className="text-aurora-green mt-0.5 flex-shrink-0" />
                      ) : (
                        <FaCircle className="text-white/15 mt-0.5 flex-shrink-0 text-sm" />
                      )}
                      <div>
                        <span className="text-xs text-white/20 mb-0.5 block">Step {i + 1}</span>
                        <span className={`text-sm ${done ? 'text-aurora-green/80 line-through' : 'text-white/70'}`}>{step}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full content */}
          <div className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white mb-5">Full Guide</h2>
            <div className="ai-markdown text-white/70 leading-relaxed">
              <ReactMarkdown>{tutorial.content}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Sidebar - right */}
        <div className="space-y-6">
          {/* AI Explain */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaLightbulb className="text-aurora-cyan" />
              <h3 className="text-sm font-bold text-white">Concept Explainer</h3>
            </div>
            <p className="text-xs text-white/30 mb-3">Type any concept from the tutorial and get it explained simply.</p>
            <form onSubmit={(e) => { e.preventDefault(); const text = e.target.concept.value; if (text.trim()) handleExplain(text.trim()); }}>
              <input
                name="concept"
                type="text"
                placeholder="e.g. 'petal fold' or 'wet-on-wet'"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-aurora-cyan/50 mb-3"
              />
              <button
                type="submit"
                disabled={explaining}
                className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white text-sm font-semibold disabled:opacity-40 hover:shadow-lg transition-all"
              >
                {explaining ? 'Thinking...' : 'Explain This'}
              </button>
            </form>

            {explanation && (
              <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-xs text-white/60 leading-relaxed">
                  <TypingMessage content={explanation} />
                </div>
              </div>
            )}
          </div>

          {/* Ask Lumina */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FaBrain className="text-aurora-cyan" />
              <h3 className="text-sm font-bold text-white">Need More Help?</h3>
            </div>
            <p className="text-xs text-white/30 mb-3">Chat with Lumina AI for deeper guidance on this tutorial.</p>
            <button
              onClick={() => setChatOpen(true)}
              className="w-full px-4 py-2.5 rounded-xl glass text-sm text-aurora-cyan hover:bg-white/10 transition-all"
            >
              Chat with Lumina
            </button>
          </div>

          {/* Like & Favorite */}
          <div className="flex gap-3">
            <button
              onClick={() => likeTutorial(tutorial._id)}
              className="flex-1 glass rounded-2xl p-4 flex items-center justify-center gap-2 text-sm text-white/40 hover:text-aurora-pink hover:bg-white/5 transition-all"
            >
              <FaHeart /> {tutorial.likes || 0}
            </button>
            <button
              onClick={() => toggleFavorite(tutorial._id)}
              className={`flex-1 glass rounded-2xl p-4 flex items-center justify-center gap-2 text-sm transition-all ${
                isFavorited(tutorial._id) ? 'text-aurora-cyan bg-aurora-cyan/5' : 'text-white/40 hover:text-aurora-cyan hover:bg-white/5'
              }`}
            >
              {isFavorited(tutorial._id) ? <FaBookmark /> : <FaRegBookmark />}
              {isFavorited(tutorial._id) ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Tutorial Completed Banner */}
      {tutorialCompleted && (
        <div className="mt-8 glass rounded-2xl p-6 sm:p-8 border border-aurora-green/20 bg-aurora-green/5 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora-green to-emerald-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-aurora-green/30">
              <FaTrophy />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Tutorial Completed! 🎉</h3>
          <p className="text-white/40 text-sm mb-1">
            You earned <span className="text-aurora-cyan font-bold">+{tutorial.difficulty === 'advanced' ? 200 : tutorial.difficulty === 'intermediate' ? 100 : 50} XP</span>
          </p>

          {nextTutorial ? (
            <div className="mt-6">
              <p className="text-white/30 text-xs mb-3 uppercase tracking-wider">Recommended Next</p>
              <Link
                to={`/tutorial/${nextTutorial._id}`}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-semibold hover:shadow-lg transition-all"
              >
                {nextTutorial.title} <FaArrowRight className="text-sm" />
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <Link
                to="/tutorials"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                Browse More Tutorials <FaArrowRight className="text-sm" />
              </Link>
            </div>
          )}

          {!isLoggedIn && (
            <p className="mt-4 text-white/20 text-xs">
              <Link to="/auth" className="text-aurora-cyan hover:underline">Sign in</Link> to save your progress and earn XP!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TutorialDetailPage;