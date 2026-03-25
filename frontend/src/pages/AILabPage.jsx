import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaRocket, FaMagic, FaSpinner, FaCheckCircle, FaArrowRight, FaBrain, FaLock } from 'react-icons/fa';

const diffOptions = [
  { value: 'beginner', label: 'Beginner', desc: 'No experience needed', color: 'border-aurora-green/30 hover:border-aurora-green/60' },
  { value: 'intermediate', label: 'Intermediate', desc: 'Some basics known', color: 'border-aurora-cyan/30 hover:border-aurora-cyan/60' },
  { value: 'advanced', label: 'Advanced', desc: 'Ready for depth', color: 'border-aurora-pink/30 hover:border-aurora-pink/60' },
];

const quickIdeas = [
  'How to solve a Rubik\'s Cube',
  'Making homemade pasta from scratch',
  'Photography composition techniques',
  'Basic electronics and circuits',
  'Creative writing for beginners',
  'Home workout without equipment',
  'Beginner card magic tricks',
  'Growing herbs indoors',
  'Digital illustration basics',
  'Public speaking confidence tips',
  'Introduction to astronomy',
  'Knitting a scarf for beginners',
];

const AILabPage = () => {
  const { generateTutorial, aiStatus, isLoggedIn, user } = useApp();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!topic.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateTutorial(topic.trim(), difficulty);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate tutorial.';
      setError(msg);
    }
    setGenerating(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 text-sm">
          <FaMagic className="text-aurora-pink" />
          <span className="text-white/60">Tutorial Studio</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
          Tutorial <span className="gradient-text">Studio</span>
        </h1>
        <p className="text-white/40 max-w-xl mx-auto text-lg">
          Type any topic and Lumina creates a complete, custom tutorial with steps — ready to follow in seconds.
        </p>
      </div>

      {/* Login Gate */}
      {!isLoggedIn ? (
        <div className="glass rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-pink/20 flex items-center justify-center mx-auto mb-6">
            <FaLock className="text-3xl text-aurora-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Sign In Required</h2>
          <p className="text-white/40 mb-6 max-w-md mx-auto">Create an account or sign in to generate custom tutorials on any topic.</p>
          <Link to="/auth" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-bold text-lg shadow-2xl hover:shadow-aurora-cyan/30 transition-all hover:scale-105">
            Sign In to Generate
          </Link>
        </div>
      ) : user?.skill_level === 'undecided' ? (
        <div className="glass rounded-3xl p-8 sm:p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 via-aurora-blue/20 to-aurora-pink/20 flex items-center justify-center mx-auto mb-6">
            <FaBrain className="text-3xl text-aurora-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Complete Your Assessment</h2>
          <p className="text-white/40 mb-6 max-w-md mx-auto">Take a quick skill assessment first so we can tailor generated tutorials to your level.</p>
          <Link to="/assessment" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-bold text-lg shadow-2xl hover:shadow-aurora-cyan/30 transition-all hover:scale-105">
            Take Assessment
          </Link>
        </div>
      ) : (
      <>
      {/* Generator */}
      <div className="glass rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-aurora-cyan/5 rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-aurora-pink/5 rounded-full blur-[80px]" />

        <div className="relative z-10">
          {/* Topic input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white/60 mb-2">What do you want to learn?</label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g., How to solve a Rubik's Cube, Basics of piano, Making sushi at home..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-lg placeholder-white/20 focus:outline-none focus:border-aurora-cyan/50 focus:ring-2 focus:ring-aurora-cyan/20 transition-all"
                disabled={generating}
              />
              {topic && !generating && (
                <button onClick={() => setTopic('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Difficulty selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white/60 mb-3">Difficulty Level</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {diffOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  disabled={generating}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                    difficulty === opt.value
                      ? `bg-white/10 ${opt.color.replace('hover:', '')} shadow-lg`
                      : `bg-white/[0.02] border-white/5 ${opt.color}`
                  }`}
                >
                  <div className="text-sm font-bold text-white">{opt.label}</div>
                  <div className="text-[11px] text-white/30 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || generating}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-bold text-lg shadow-2xl shadow-aurora-cyan/20 disabled:opacity-30 hover:shadow-aurora-cyan/40 transition-all active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <FaSpinner className="animate-spin" />
                Generating your tutorial...
              </>
            ) : (
              <>
                <FaRocket />
                Generate Tutorial
              </>
            )}
          </button>

          {/* Status note */}
          <div className="mt-4 text-center">
            <span className="text-xs text-white/20">
              {aiStatus?.ai_available
                ? 'Lumina is ready to generate your tutorial'
                : 'Running in limited mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick ideas */}
      {!result && !generating && (
        <div className="mb-12">
          <h3 className="text-sm font-semibold text-white/30 mb-3">Quick Ideas</h3>
          <div className="flex flex-wrap gap-2">
            {quickIdeas.map((idea, i) => (
              <button
                key={i}
                onClick={() => setTopic(idea)}
                className="px-3 py-1.5 rounded-full glass text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all"
              >
                {idea}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading animation */}
      {generating && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink flex items-center justify-center">
                <FaBrain className="text-2xl text-white animate-pulse" />
              </div>
              <div className="absolute -inset-2 rounded-2xl border-2 border-aurora-cyan/30 animate-ping" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Creating your tutorial...</h3>
          <p className="text-white/30 text-sm">Analyzing topic, structuring content, writing steps</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-aurora-cyan animate-bounce"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass rounded-2xl p-6 border border-aurora-pink/20 bg-aurora-pink/5">
          <p className="text-aurora-pink text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FaCheckCircle className="text-aurora-green" />
                <span className="text-xs text-aurora-green font-semibold uppercase tracking-wider">Tutorial Created</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{result.title}</h2>
              <p className="text-white/40 mt-1">{result.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-aurora-cyan/10 text-aurora-cyan border border-aurora-cyan/20">{result.category}</span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">{result.difficulty}</span>
            <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">{result.duration}</span>
            <span className="px-3 py-1 rounded-full bg-aurora-pink/10 text-aurora-pink border border-aurora-pink/20 flex items-center gap-1">
              <FaRocket className="text-[8px]" /> Generated
            </span>
          </div>

          {/* Preview steps */}
          <div>
            <h3 className="text-sm font-semibold text-white/50 mb-3">Steps ({result.steps.length})</h3>
            <div className="space-y-2">
              {result.steps.slice(0, 4).map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/40">
                  <span className="text-aurora-cyan font-bold">{i + 1}.</span>
                  {step}
                </div>
              ))}
              {result.steps.length > 4 && (
                <p className="text-xs text-white/20">+ {result.steps.length - 4} more steps...</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/tutorial/${result._id}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-semibold hover:shadow-lg transition-all"
            >
              Start Learning <FaArrowRight className="text-sm" />
            </Link>
            <button
              onClick={() => { setResult(null); setTopic(''); }}
              className="flex-1 px-6 py-3 rounded-xl glass text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

export default AILabPage;
