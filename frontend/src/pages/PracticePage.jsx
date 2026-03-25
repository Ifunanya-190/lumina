import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { FaPlay, FaCheck, FaTimes, FaRedo, FaSpinner, FaBolt, FaLightbulb, FaArrowRight, FaDumbbell, FaCode, FaPencilAlt, FaClock, FaStop, FaPause } from 'react-icons/fa';

const modeOptions = [
  { value: 'quiz', label: 'Quiz Mode', desc: 'Multiple choice questions', icon: <FaBolt />, gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink' },
  { value: 'scenario', label: 'Scenario Lab', desc: 'Real-world problem solving', icon: <FaCode />, gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink' },
  { value: 'flashcard', label: 'Flashcards', desc: 'Quick recall practice', icon: <FaLightbulb />, gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink' },
];

const PracticePage = () => {
  const { isLoggedIn, api, showToast, requireAuth } = useApp();
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('quiz');
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flashcardResults, setFlashcardResults] = useState([]); // 'got' or 'review' per card
  const [scenarioAnswer, setScenarioAnswer] = useState('');
  const [scenarioFeedback, setScenarioFeedback] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [stopped, setStopped] = useState(false);

  // Timer state
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(120); // seconds for whole session
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);

  const extractJSON = (text) => {
    try { return JSON.parse(text); } catch {}
    let cleaned = text.replace(/```(?:json)?[\s\S]*?\n/g, '').replace(/```/g, '').trim();
    try { return JSON.parse(cleaned); } catch {}
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try { return JSON.parse(text.slice(start, end + 1)); } catch {}
    }
    return null;
  };

  // Warning beep using Web Audio API
  const playBeep = useCallback((freq = 660, duration = 200, count = 1) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioCtxRef.current;
      const playOne = (delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration / 1000);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration / 1000);
      };
      for (let i = 0; i < count; i++) playOne(i * (duration + 80) / 1000);
    } catch {}
  }, []);

  // Timer logic
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerActive && !timerPaused && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          // Tick sound every second when ≤10s
          if (prev <= 11 && prev > 1) playBeep(600 + (11 - prev) * 40, 80, 1);
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerActive(false);
            setTimedOut(true);
            playBeep(880, 300, 3); // Loud triple beep on timeout
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerActive, timerPaused, timeLeft, playBeep]);

  // Auto-stop entire session on timeout (all modes)
  useEffect(() => {
    if (timedOut && session && !stopped) {
      setStopped(true);
      setTimerActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mode === 'quiz' && !showResult) {
        setShowResult(true);
        setTotalAnswered(prev => prev + 1);
      }
    }
  }, [timedOut]);

  // Start session timer once when session begins
  useEffect(() => {
    if (session && timerEnabled && !stopped) {
      setTimeLeft(timerDuration);
      setTimerActive(true);
      setTimerPaused(false);
      setTimedOut(false);
    }
  }, [session]);

  const generateSession = async () => {
    if (!topic.trim()) return;
    if (!requireAuth('use the practice simulator')) return;
    setGenerating(true);
    setSession(null);
    setCurrentQ(0);
    setScore(0);
    setTotalAnswered(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setStopped(false);
    setTimedOut(false);

    const prompts = {
      quiz: `Generate a practice quiz about "${topic}". Return ONLY a valid JSON object (no markdown, no code fences, no extra text): {"topic":"${topic}","questions":[{"question":"text","options":["a","b","c","d"],"correct":0,"explanation":"why correct"}]}. Generate exactly 8 varied-difficulty questions. ONLY output JSON.`,
      scenario: `Generate real-world practice scenarios about "${topic}". Return ONLY a valid JSON object (no markdown, no code fences, no extra text): {"topic":"${topic}","scenarios":[{"title":"scenario title","situation":"detailed real-world situation","challenge":"what the user must solve","hints":["hint1","hint2"],"idealAnswer":"what a good solution looks like"}]}. Generate exactly 4 challenging scenarios. ONLY output JSON.`,
      flashcard: `Generate flashcards about "${topic}". Return ONLY a valid JSON object (no markdown, no code fences, no extra text): {"topic":"${topic}","cards":[{"front":"question or term","back":"answer or definition"}]}. Generate exactly 12 flashcards covering key concepts. ONLY output JSON.`,
    };

    try {
      const { data } = await api().post('/ai/chat', { message: prompts[mode], context: 'practice_simulator' });
      const parsed = extractJSON(data.reply);
      if (!parsed) {
        showToast('Received an unreadable response. Please try again.', 'error');
      } else if (mode === 'quiz' && (!parsed.questions || !Array.isArray(parsed.questions))) {
        showToast('Received incomplete quiz data. Try again.', 'warning');
      } else if (mode === 'scenario' && (!parsed.scenarios || !Array.isArray(parsed.scenarios))) {
        showToast('Received incomplete scenario data. Try again.', 'warning');
      } else if (mode === 'flashcard' && (!parsed.cards || !Array.isArray(parsed.cards))) {
        showToast('Received incomplete flashcard data. Try again.', 'warning');
      } else {
        setSession(parsed);
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate practice session. Try again.';
      showToast(msg, 'error');
    }
    setGenerating(false);
  };

  const handleQuizAnswer = (idx) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);
    if (idx === session.questions[currentQ].correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setTimedOut(false);
    setCurrentQ(prev => prev + 1);
  };

  const evaluateScenario = async () => {
    if (!scenarioAnswer.trim()) return;
    setEvaluating(true);
    try {
      const scenario = session.scenarios[currentQ];
      const { data } = await api().post('/ai/chat', {
        message: `Evaluate this answer to a practice scenario.
Scenario: "${scenario.situation}"
Challenge: "${scenario.challenge}"
User's Answer: "${scenarioAnswer}"
Ideal Answer: "${scenario.idealAnswer}"
Return ONLY a valid JSON object (no markdown, no code fences, no extra text): {"score":number_1_to_10,"feedback":"detailed feedback","strengths":["str1"],"improvements":["imp1"]}. ONLY output JSON.`,
        context: 'practice_evaluator'
      });
      const parsed = extractJSON(data.reply);
      if (parsed && typeof parsed.score === 'number') {
        setScenarioFeedback(parsed);
      } else {
        setScenarioFeedback({ score: 0, feedback: 'Could not parse evaluation. Try again.', strengths: [], improvements: [] });
      }
    } catch {
      setScenarioFeedback({ score: 0, feedback: 'Could not evaluate. Try again.', strengths: [], improvements: [] });
    }
    setEvaluating(false);
  };

  const nextScenario = () => {
    setScenarioAnswer('');
    setScenarioFeedback(null);
    setCurrentQ(prev => prev + 1);
  };

  const stopSession = () => {
    setStopped(true);
    setTimerActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetSession = () => {
    setSession(null);
    setCurrentQ(0);
    setScore(0);
    setTotalAnswered(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setFlipped(false);
    setFlashcardResults([]);
    setScenarioAnswer('');
    setScenarioFeedback(null);
    setStopped(false);
    setTimerActive(false);
    setTimerPaused(false);
    setTimedOut(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const quickTopics = [
    'JavaScript fundamentals', 'Cooking techniques', 'Music theory basics',
    'Photography composition', 'Fitness & nutrition', 'Creative writing',
    'Basic electronics', 'Art color theory', 'Personal finance',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Floating Side Timer */}
      {timerEnabled && timerActive && timeLeft <= 10 && timeLeft > 0 && !stopped && session && (
        <div className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50 border-2 border-red-300 animate-pulse">
            <span className="text-white text-xl sm:text-2xl font-black">{timeLeft}</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 text-sm">
          <FaDumbbell className="text-aurora-cyan" />
          <span className="text-white/60">Practice Engine</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
          Practice <span className="gradient-text">Simulator</span>
        </h1>
        <p className="text-white/40 max-w-xl mx-auto">
          Pick any topic and test yourself with quizzes, real-world scenarios, or flashcards — with optional timed sessions.
        </p>
      </div>

      {/* Setup */}
      {!session && !generating && (
        <div className="glass rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto">
          {/* Mode Selection */}
          <h3 className="text-sm font-semibold text-white/40 mb-3">Choose Practice Mode</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {modeOptions.map(m => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  mode === m.value
                    ? 'border-aurora-cyan/30 bg-aurora-cyan/5'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.gradient} flex items-center justify-center text-nebula-900 mx-auto mb-2`}>
                  {m.icon}
                </div>
                <span className="text-xs font-bold text-white block">{m.label}</span>
                <span className="text-[10px] text-white/30">{m.desc}</span>
              </button>
            ))}
          </div>

          {/* Topic */}
          <h3 className="text-sm font-semibold text-white/40 mb-2">What to practice?</h3>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateSession()}
            placeholder="e.g. JavaScript closures, Italian cooking, music scales..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-aurora-cyan/50 mb-4"
          />

          <button
            onClick={generateSession}
            disabled={!topic.trim()}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:shadow-lg hover:shadow-aurora-cyan/20 transition-all hover:scale-[1.02] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <FaPlay /> Start Practice
          </button>

          {/* Timer Option */}
          <div className="mt-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FaClock className="text-aurora-cyan text-xs" />
                <span className="text-sm text-white/60 font-medium">Challenge Timer</span>
              </div>
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`w-11 h-6 rounded-full transition-all relative ${timerEnabled ? 'bg-aurora-cyan' : 'bg-white/10'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-nebula-900 absolute top-0.5 transition-all ${timerEnabled ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
            {timerEnabled && (
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs text-white/30">Session time:</span>
                {[
                  { val: 60, label: '1m' },
                  { val: 120, label: '2m' },
                  { val: 180, label: '3m' },
                  { val: 300, label: '5m' },
                  { val: 600, label: '10m' },
                ].map(t => (
                  <button
                    key={t.val}
                    onClick={() => setTimerDuration(t.val)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      timerDuration === t.val ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30' : 'bg-white/5 text-white/30 border border-white/5 hover:text-white/60'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {quickTopics.map((t, i) => (
              <button key={i} onClick={() => setTopic(t)} className="px-3 py-1.5 rounded-full glass text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all">{t}</button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {generating && (
        <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto">
          <FaSpinner className="text-3xl text-aurora-cyan animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Generating your practice session...</h3>
          <p className="text-white/30 text-sm">Creating {mode === 'quiz' ? 'questions' : mode === 'scenario' ? 'scenarios' : 'flashcards'} about {topic}</p>
        </div>
      )}

      {/* Quiz Mode */}
      {session && mode === 'quiz' && session.questions && !stopped && (
        currentQ < session.questions.length ? (
          <div className="glass rounded-3xl p-5 sm:p-8 max-w-2xl mx-auto">
            {/* Progress + Timer + Stop */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-xs text-white/30">Question {currentQ + 1} of {session.questions.length}</span>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {timerEnabled && timerActive && timeLeft > 10 && (
                  <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-bold ${
                    timeLeft <= 30 ? 'bg-amber-400/10 text-amber-400' : 'bg-aurora-cyan/10 text-aurora-cyan'
                  }`}>
                    <FaClock className="text-[10px]" />
                    {formatTime(timeLeft)}
                    <button onClick={() => setTimerPaused(!timerPaused)} className="ml-1 opacity-60 hover:opacity-100">
                      {timerPaused ? <FaPlay className="text-[8px]" /> : <FaPause className="text-[8px]" />}
                    </button>
                  </div>
                )}
                {timedOut && <span className="text-xs text-red-400 font-bold">Time's up!</span>}
                <span className="text-xs text-aurora-cyan font-bold">{score}/{totalAnswered}</span>
                <button onClick={stopSession} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-bold hover:bg-red-400/20 transition-all">
                  <FaStop className="text-[9px]" /> Stop
                </button>
              </div>
            </div>
            <div className="h-1 rounded-full bg-white/5 mb-6 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink transition-all" style={{ width: `${((currentQ) / session.questions.length) * 100}%` }} />
            </div>

            <h3 className="text-lg font-bold text-white mb-6">{session.questions[currentQ].question}</h3>

            <div className="space-y-3">
              {session.questions[currentQ].options.map((opt, i) => {
                const isCorrect = i === session.questions[currentQ].correct;
                const isSelected = selectedAnswer === i;
                let classes = 'w-full p-4 rounded-xl text-left text-sm transition-all flex items-center gap-3 ';
                if (showResult) {
                  if (isCorrect) classes += 'border-aurora-cyan/40 bg-aurora-cyan/10 text-white';
                  else if (isSelected) classes += 'border-red-400/40 bg-red-400/10 text-red-300';
                  else classes += 'border-white/5 bg-white/[0.02] text-white/30';
                } else {
                  classes += 'border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/5 hover:border-white/20 cursor-pointer';
                }
                return (
                  <button key={i} onClick={() => handleQuizAnswer(i)} disabled={showResult} className={`border ${classes}`}>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      showResult && isCorrect ? 'bg-aurora-cyan text-nebula-900' : showResult && isSelected ? 'bg-red-400 text-white' : 'bg-white/5 text-white/30'
                    }`}>
                      {showResult && isCorrect ? <FaCheck /> : showResult && isSelected ? <FaTimes /> : String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {showResult && (
              <div className="mt-6">
                <div className={`p-4 rounded-xl text-sm ${selectedAnswer === session.questions[currentQ].correct ? 'bg-aurora-cyan/5 border border-aurora-cyan/20 text-white/70' : 'bg-red-400/5 border border-red-400/20 text-white/70'}`}>
                  <span className="font-bold text-white block mb-1">{selectedAnswer === session.questions[currentQ].correct ? '✓ Correct!' : '✗ Incorrect'}</span>
                  {session.questions[currentQ].explanation}
                </div>
                <button onClick={nextQuestion} className="mt-4 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                  {currentQ < session.questions.length - 1 ? <>Next Question <FaArrowRight /></> : 'See Results'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Quiz Complete */
          <div className="glass rounded-3xl p-10 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">{score >= session.questions.length * 0.8 ? '🏆' : score >= session.questions.length * 0.5 ? '👏' : '📚'}</div>
            <h3 className="text-2xl font-black text-white mb-2">Practice Complete!</h3>
            <div className="text-4xl font-black gradient-text mb-2">{score}/{session.questions.length}</div>
            <p className="text-white/40 text-sm mb-6">
              {score === session.questions.length ? 'Perfect score! You nailed it.' :
               score >= session.questions.length * 0.8 ? 'Great job! Almost perfect.' :
               score >= session.questions.length * 0.5 ? 'Good effort. Keep practicing!' : 
               'Keep studying and try again!'}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={resetSession} className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                <FaRedo /> Try Again
              </button>
              <button onClick={() => { resetSession(); setTopic(''); }} className="px-6 py-3 rounded-xl glass text-white/60 text-sm font-semibold hover:text-white hover:bg-white/10 transition-all">
                New Topic
              </button>
            </div>
          </div>
        )
      )}

      {/* Stopped Early (Quiz / Flashcard) */}
      {session && stopped && (
        <div className="glass rounded-3xl p-10 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aurora-cyan/20 to-aurora-blue/20 flex items-center justify-center mx-auto mb-5">
            <FaStop className="text-2xl text-aurora-cyan" />
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Session Ended</h3>
          {mode === 'quiz' && (
            <div className="mb-4">
              <div className="text-3xl font-black gradient-text mb-1">{score}/{totalAnswered}</div>
              <p className="text-white/40 text-sm">
                You answered {totalAnswered} of {session.questions?.length || 0} questions
                {totalAnswered > 0 && ` — ${Math.round((score / totalAnswered) * 100)}% accuracy`}
              </p>
            </div>
          )}
          {mode === 'flashcard' && (
            <div className="mb-4">
              <p className="text-white/40 text-sm mb-2">You reviewed {currentQ} of {session.cards?.length || 0} cards</p>
              {flashcardResults.length > 0 && (
                <p className="text-white/30 text-xs">
                  <span className="text-aurora-blue font-bold">{flashcardResults.filter(r => r === 'got').length}</span> got it · <span className="text-amber-400 font-bold">{flashcardResults.filter(r => r === 'review').length}</span> need review
                </p>
              )}
            </div>
          )}
          {mode === 'scenario' && (
            <p className="text-white/40 text-sm mb-4">You completed {currentQ} of {session.scenarios?.length || 0} scenarios</p>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={resetSession} className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
              <FaRedo /> Start Over
            </button>
            <button onClick={() => { resetSession(); setTopic(''); }} className="px-6 py-3 rounded-xl glass text-white/60 text-sm font-semibold hover:text-white hover:bg-white/10 transition-all">
              New Topic
            </button>
          </div>
        </div>
      )}

      {/* Scenario Mode */}
      {session && mode === 'scenario' && session.scenarios && !stopped && (
        currentQ < session.scenarios.length ? (
          <div className="glass rounded-3xl p-8 max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-xs text-white/30">Scenario {currentQ + 1} of {session.scenarios.length}</span>
              <div className="flex flex-wrap items-center gap-2">
                {timerEnabled && timerActive && timeLeft > 10 && (
                  <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-bold ${
                    timeLeft <= 30 ? 'bg-amber-400/10 text-amber-400' : 'bg-aurora-cyan/10 text-aurora-cyan'
                  }`}>
                    <FaClock className="text-[10px]" />
                    {formatTime(timeLeft)}
                    <button onClick={() => setTimerPaused(!timerPaused)} className="ml-1 opacity-60 hover:opacity-100">
                      {timerPaused ? <FaPlay className="text-[8px]" /> : <FaPause className="text-[8px]" />}
                    </button>
                  </div>
                )}
                <button onClick={resetSession} className="text-xs text-white/30 hover:text-white transition-colors flex items-center gap-1"><FaRedo className="text-[10px]" /> Reset</button>
                <button onClick={stopSession} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-bold hover:bg-red-400/20 transition-all">
                  <FaStop className="text-[9px]" /> Stop
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{session.scenarios[currentQ].title}</h3>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 mb-4">
              <p className="text-white/60 text-sm leading-relaxed">{session.scenarios[currentQ].situation}</p>
            </div>
            <p className="text-aurora-cyan text-sm font-semibold mb-4">Challenge: {session.scenarios[currentQ].challenge}</p>

            {!scenarioFeedback && (
              <>
                <textarea
                  value={scenarioAnswer}
                  onChange={(e) => setScenarioAnswer(e.target.value)}
                  placeholder="Type your solution here..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-aurora-cyan/50 resize-none mb-3"
                />
                {session.scenarios[currentQ].hints?.length > 0 && (
                  <details className="mb-4">
                    <summary className="text-xs text-white/30 cursor-pointer hover:text-white/50">Show hints</summary>
                    <ul className="mt-2 space-y-1">
                      {session.scenarios[currentQ].hints.map((h, i) => (
                        <li key={i} className="text-xs text-white/40 flex items-start gap-2"><FaLightbulb className="text-aurora-cyan mt-0.5 text-[10px] shrink-0" />{h}</li>
                      ))}
                    </ul>
                  </details>
                )}
                <button
                  onClick={evaluateScenario}
                  disabled={!scenarioAnswer.trim() || evaluating}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm disabled:opacity-40 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  {evaluating ? <><FaSpinner className="animate-spin" /> Evaluating...</> : <><FaPencilAlt /> Submit Answer</>}
                </button>
              </>
            )}

            {scenarioFeedback && (
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black ${
                    scenarioFeedback.score >= 8 ? 'bg-aurora-cyan/20 text-aurora-cyan' : scenarioFeedback.score >= 5 ? 'bg-aurora-blue/20 text-aurora-blue' : 'bg-red-400/20 text-red-400'
                  }`}>{scenarioFeedback.score}/10</div>
                  <p className="text-white/60 text-sm flex-1">{scenarioFeedback.feedback}</p>
                </div>
                {scenarioFeedback.strengths?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-aurora-cyan mb-1">Strengths</h4>
                    <ul className="space-y-1">{scenarioFeedback.strengths.map((s, i) => <li key={i} className="text-xs text-white/50 flex items-start gap-2"><FaCheck className="text-aurora-cyan mt-0.5 text-[10px]" />{s}</li>)}</ul>
                  </div>
                )}
                {scenarioFeedback.improvements?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-aurora-blue mb-1">Can Improve</h4>
                    <ul className="space-y-1">{scenarioFeedback.improvements.map((s, i) => <li key={i} className="text-xs text-white/50 flex items-start gap-2"><FaArrowRight className="text-aurora-blue mt-0.5 text-[10px]" />{s}</li>)}</ul>
                  </div>
                )}
                <button onClick={nextScenario} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                  {currentQ < session.scenarios.length - 1 ? <>Next Scenario <FaArrowRight /></> : 'Finish'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass rounded-3xl p-10 text-center max-w-lg mx-auto">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-black text-white mb-2">All Scenarios Complete!</h3>
            <p className="text-white/40 text-sm mb-6">You've worked through all the practice scenarios.</p>
            <button onClick={resetSession} className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
              <FaRedo /> Practice More
            </button>
          </div>
        )
      )}

      {/* Flashcard Mode */}
      {session && mode === 'flashcard' && session.cards && !stopped && (
        currentQ < session.cards.length ? (
          <div className="max-w-lg mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <span className="text-xs text-white/30">Card {currentQ + 1} of {session.cards.length}</span>
              <div className="flex flex-wrap items-center gap-2">
                {timerEnabled && timerActive && timeLeft > 10 && (
                  <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg text-xs font-bold ${
                    timeLeft <= 30 ? 'bg-amber-400/10 text-amber-400' : 'bg-aurora-cyan/10 text-aurora-cyan'
                  }`}>
                    <FaClock className="text-[10px]" />
                    {formatTime(timeLeft)}
                    <button onClick={() => setTimerPaused(!timerPaused)} className="ml-1 opacity-60 hover:opacity-100">
                      {timerPaused ? <FaPlay className="text-[8px]" /> : <FaPause className="text-[8px]" />}
                    </button>
                  </div>
                )}
                <button onClick={resetSession} className="text-xs text-white/30 hover:text-white transition-colors flex items-center gap-1"><FaRedo className="text-[10px]" /> Reset</button>
                <button onClick={stopSession} className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 text-xs font-bold hover:bg-red-400/20 transition-all">
                  <FaStop className="text-[9px]" /> Stop
                </button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mb-5">
              {session.cards.map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all ${i < currentQ ? 'w-4 bg-aurora-cyan' : i === currentQ ? 'w-6 bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink' : 'w-2 bg-white/10'}`} />
              ))}
            </div>

            <button
              onClick={() => setFlipped(!flipped)}
              className="w-full glass rounded-3xl p-10 text-center transition-all hover:bg-white/5 min-h-[250px] flex flex-col items-center justify-center"
            >
              {!flipped ? (
                <>
                  <span className="text-[10px] text-aurora-cyan uppercase tracking-wider mb-4">Concept</span>
                  <p className="text-xl font-bold text-white leading-relaxed">{session.cards[currentQ].front}</p>
                  <span className="text-xs text-white/20 mt-6">Think about it, then tap to check your answer</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] text-aurora-blue uppercase tracking-wider mb-4">Answer</span>
                  <p className="text-lg text-white/80 leading-relaxed">{session.cards[currentQ].back}</p>
                </>
              )}
            </button>

            {!flipped ? (
              <div className="mt-4 text-center">
                <p className="text-xs text-white/25">Try to recall the answer in your mind before flipping</p>
              </div>
            ) : (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => { setFlashcardResults(prev => [...prev, 'got']); setFlipped(false); setCurrentQ(prev => prev + 1); }}
                  className="flex-1 px-4 py-3 rounded-xl bg-aurora-blue/15 border border-aurora-blue/30 text-aurora-blue font-bold text-sm hover:bg-aurora-blue/25 transition-all flex items-center justify-center gap-2"
                >
                  <FaCheck /> Got It
                </button>
                <button
                  onClick={() => { setFlashcardResults(prev => [...prev, 'review']); setFlipped(false); setCurrentQ(prev => prev + 1); }}
                  className="flex-1 px-4 py-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-sm hover:bg-amber-400/20 transition-all flex items-center justify-center gap-2"
                >
                  <FaRedo /> Need Review
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Flashcard Complete — redesigned */
          <div className="max-w-lg mx-auto">
            <div className="glass rounded-3xl p-8 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-aurora-cyan/10 rounded-full blur-[60px]" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-aurora-blue/10 rounded-full blur-[60px]" />

              <div className="relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink flex items-center justify-center shadow-lg shadow-aurora-cyan/20">
                    <FaLightbulb className="text-3xl text-nebula-900" />
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white text-center mb-1">All Cards Reviewed</h3>
                <p className="text-white/30 text-sm text-center mb-6">
                  {session.cards.length} concepts covered on <span className="text-aurora-cyan font-medium">{session.topic || topic}</span>
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black gradient-text">{session.cards.length}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Cards</div>
                  </div>
                  <div className="bg-aurora-blue/5 border border-aurora-blue/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-aurora-blue">{flashcardResults.filter(r => r === 'got').length}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Got It</div>
                  </div>
                  <div className="bg-amber-400/5 border border-amber-400/20 rounded-xl p-3 text-center">
                    <div className="text-2xl font-black text-amber-400">{flashcardResults.filter(r => r === 'review').length}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider">Review</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => { setCurrentQ(0); setFlipped(false); }}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                  >
                    <FaRedo /> Review Again
                  </button>
                  <button
                    onClick={() => { resetSession(); setTopic(''); }}
                    className="w-full px-6 py-3 rounded-xl glass text-white/50 text-sm font-semibold hover:text-white hover:bg-white/10 transition-all"
                  >
                    Practice Something Else
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default PracticePage;
