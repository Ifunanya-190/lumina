import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  FaRoute, FaPlay, FaCheck, FaStar, FaSpinner, FaRocket, FaMapMarkerAlt,
  FaFlag, FaRedo, FaFire, FaBolt, FaTrophy, FaCalendarDay,
  FaChevronDown, FaChevronUp, FaLightbulb, FaQuoteLeft, FaGraduationCap
} from 'react-icons/fa';

const JourneyPage = () => {
  const { api, showToast, requireAuth } = useApp();
  const [goal, setGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [journey, setJourney] = useState(null);

  // Daily mission state
  const [currentDay, setCurrentDay] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [coachMsg, setCoachMsg] = useState('');
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationRef = useRef(null);

  const [savedJourneys, setSavedJourneys] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lumina_journeys_v2');
      if (saved) setSavedJourneys(JSON.parse(saved));
    } catch {}
  }, []);

  // Load journey progress
  useEffect(() => {
    if (!journey) return;
    try {
      const key = `journey_progress_${journey.id || 'current'}`;
      const data = localStorage.getItem(key);
      if (data) {
        const p = JSON.parse(data);
        setCurrentDay(p.currentDay || 0);
        setCompletedTasks(p.completedTasks || {});
        setXp(p.xp || 0);
        setStreak(p.streak || 0);
      }
    } catch {}
  }, [journey]);

  const saveProgress = useCallback(() => {
    if (!journey) return;
    const key = `journey_progress_${journey.id || 'current'}`;
    localStorage.setItem(key, JSON.stringify({ currentDay, completedTasks, xp, streak }));
  }, [journey, currentDay, completedTasks, xp, streak]);

  useEffect(() => { saveProgress(); }, [saveProgress]);

  const saveJourney = (j) => {
    const entry = { ...j, id: Date.now(), createdAt: new Date().toISOString() };
    const updated = [entry, ...savedJourneys].slice(0, 10);
    setSavedJourneys(updated);
    localStorage.setItem('lumina_journeys_v2', JSON.stringify(updated));
    return entry;
  };

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

  const generateJourney = async () => {
    if (!goal.trim()) return;
    if (!requireAuth('generate a learning journey')) return;
    setGenerating(true);
    try {
      const { data } = await api().post('/ai/chat', {
        message: `You are a learning coach. Create a 7-day daily mission plan for this goal: "${goal}".
Return ONLY valid JSON (no markdown, no fences). Structure:
{
  "title": "journey title",
  "description": "motivational 1-line overview",
  "days": [
    {
      "day": 1,
      "theme": "short theme title",
      "coachNote": "motivational message from coach (1-2 sentences, personal tone)",
      "missions": [
        { "title": "mission title", "description": "what to do (1-2 sentences)", "type": "learn|practice|build|reflect", "xp": 10 }
      ],
      "bonusMission": { "title": "optional stretch goal", "description": "details", "xp": 15 }
    }
  ],
  "milestones": [
    { "day": 3, "title": "milestone name", "description": "what you've achieved" },
    { "day": 7, "title": "final milestone", "description": "you've completed the journey" }
  ]
}
Each day should have 3-4 missions plus 1 bonus. Mix types: learn, practice, build, reflect. XP values 10-20 per mission. Days should progress in difficulty. Include 2-3 milestones. Make it practical, actionable, and encouraging. ONLY output JSON.`,
        context: 'journey_generator'
      });

      const parsed = extractJSON(data.reply);
      if (parsed && parsed.days && Array.isArray(parsed.days)) {
        const saved = saveJourney({ ...parsed, goal });
        setJourney(saved);
        setCurrentDay(0);
        setCompletedTasks({});
        setXp(0);
        setStreak(0);
        setCoachMsg('');
      } else {
        showToast('Received incomplete data. Try again.', 'warning');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate journey. Try again.';
      showToast(msg, 'error');
    }
    setGenerating(false);
  };

  const toggleTask = (dayIdx, taskIdx, taskXp, isBonus = false) => {
    const key = `${dayIdx}-${isBonus ? 'bonus' : taskIdx}`;
    setCompletedTasks(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        setXp(x => Math.max(0, x - taskXp));
      } else {
        next[key] = true;
        setXp(x => x + taskXp);
        const day = journey.days[dayIdx];
        const totalMissions = day.missions?.length || 0;
        const doneCount = day.missions?.filter((_, mi) => next[`${dayIdx}-${mi}`]).length || 0;
        if (doneCount === totalMissions && dayIdx >= currentDay) {
          setCurrentDay(dayIdx + 1);
          setStreak(s => s + 1);
          const milestone = journey.milestones?.find(m => m.day === dayIdx + 1);
          if (milestone) {
            setShowCelebration(true);
            celebrationRef.current = milestone;
            setTimeout(() => setShowCelebration(false), 4000);
          }
        }
      }
      return next;
    });
  };

  const getCoachCheckIn = async () => {
    if (!requireAuth('get coach feedback')) return;
    setLoadingCoach(true);
    try {
      const dayData = journey.days[Math.min(currentDay, journey.days.length - 1)];
      const { data } = await api().post('/ai/chat', {
        message: `You are Lumina Coach, a supportive and concise learning mentor. The student is on day ${currentDay + 1} of a 7-day "${journey.title}" journey. They have ${xp} XP and a ${streak}-day streak. Today's theme: "${dayData.theme}". Give a short (2-3 sentences max) personalized check-in. Be warm but brief. If streak > 3, praise consistency. If day 1, welcome them. If near end, build excitement. Reply with ONLY the coach message text, no JSON, no quotes.`,
        context: 'journey_coach'
      });
      setCoachMsg(data.reply.replace(/^["']|["']$/g, ''));
    } catch {
      setCoachMsg("Keep going — every step forward counts. I'm here whenever you need guidance.");
    }
    setLoadingCoach(false);
  };

  const getDayProgress = (dayIdx) => {
    const day = journey?.days?.[dayIdx];
    if (!day?.missions) return 0;
    const done = day.missions.filter((_, mi) => completedTasks[`${dayIdx}-${mi}`]).length;
    return Math.round((done / day.missions.length) * 100);
  };

  const totalProgress = journey ? Math.round((currentDay / (journey.days?.length || 7)) * 100) : 0;
  const allComplete = journey && currentDay >= (journey.days?.length || 7);

  const typeStyles = {
    learn: { icon: FaGraduationCap, color: 'text-aurora-cyan', bg: 'bg-aurora-cyan/10' },
    practice: { icon: FaPlay, color: 'text-aurora-blue', bg: 'bg-aurora-blue/10' },
    build: { icon: FaRocket, color: 'text-aurora-gold', bg: 'bg-aurora-gold/10' },
    reflect: { icon: FaLightbulb, color: 'text-aurora-green', bg: 'bg-aurora-green/10' },
  };

  const quickGoals = [
    'Become a full-stack web developer',
    'Master digital photography from scratch',
    'Learn to play guitar in 3 months',
    'Build and launch a mobile app',
    'Become a professional chef at home',
    'Learn data science and machine learning',
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 text-sm">
          <FaRoute className="text-aurora-cyan" />
          <span className="text-white/60">Daily Mission Coach</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
          Your <span className="gradient-text">Journey</span>
        </h1>
        <p className="text-white/40 max-w-xl mx-auto">
          Set a learning goal and get a structured 7-day mission plan. Complete daily tasks, earn XP, and build your streak.
        </p>
      </div>

      {/* Goal Input */}
      {!journey && (
        <div className="glass rounded-3xl p-8 sm:p-10 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink flex items-center justify-center text-nebula-900">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">What do you want to master?</h2>
              <p className="text-white/30 text-xs">Your AI coach will design a 7-day mission plan.</p>
            </div>
          </div>

          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. I want to learn React and build a portfolio site this week..."
            className="w-full h-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-aurora-cyan/50 resize-none mb-4"
          />

          <button
            onClick={generateJourney}
            disabled={generating || !goal.trim()}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:shadow-lg hover:shadow-aurora-cyan/20 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {generating ? (
              <><FaSpinner className="animate-spin" /> Building your mission plan...</>
            ) : (
              <><FaRocket /> Launch My Journey</>
            )}
          </button>

          <div className="mt-6">
            <p className="text-xs text-white/20 mb-2">Quick start:</p>
            <div className="flex flex-wrap gap-2">
              {quickGoals.map((g, i) => (
                <button key={i} onClick={() => setGoal(g)} className="px-3 py-1.5 rounded-full glass text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all">
                  {g}
                </button>
              ))}
            </div>
          </div>

          {savedJourneys.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5">
              <button onClick={() => setShowSaved(!showSaved)} className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors">
                <FaFlag /> Previous Journeys ({savedJourneys.length})
                {showSaved ? <FaChevronUp className="text-[8px]" /> : <FaChevronDown className="text-[8px]" />}
              </button>
              {showSaved && (
                <div className="mt-3 space-y-2">
                  {savedJourneys.map((j, i) => (
                    <button key={i} onClick={() => { setJourney(j); setCoachMsg(''); }} className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/5 transition-all">
                      <span className="text-sm text-white font-medium">{j.title}</span>
                      <span className="block text-xs text-white/30 mt-0.5">{j.goal}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Active Journey Dashboard */}
      {journey && (
        <div>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="glass rounded-xl p-4 text-center">
              <FaCalendarDay className="text-aurora-cyan mx-auto mb-1" />
              <div className="text-2xl font-black text-white">{Math.min(currentDay + 1, journey.days?.length || 7)}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Day</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <FaBolt className="text-aurora-blue mx-auto mb-1" />
              <div className="text-2xl font-black text-white">{xp}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">XP Earned</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <FaFire className="text-aurora-gold mx-auto mb-1" />
              <div className="text-2xl font-black text-white">{streak}</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Streak</div>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <FaTrophy className="text-aurora-green mx-auto mb-1" />
              <div className="text-2xl font-black text-white">{totalProgress}%</div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider">Complete</div>
            </div>
          </div>

          {/* Journey Header */}
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold text-white">{journey.title}</h2>
                <p className="text-white/40 text-sm mt-0.5">{journey.description}</p>
              </div>
              <button onClick={() => { setJourney(null); setGoal(''); setCoachMsg(''); }} className="px-3 py-1.5 rounded-lg glass text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5">
                <FaRedo className="text-[9px]" /> New
              </button>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink transition-all duration-700" style={{ width: `${totalProgress}%` }} />
            </div>
          </div>

          {/* Coach Check-in */}
          <div className="glass rounded-2xl p-5 mb-6 border border-aurora-cyan/10">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink flex items-center justify-center text-nebula-900 shrink-0">
                <FaStar className="text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-aurora-cyan">Lumina Coach</span>
                </div>
                {coachMsg ? (
                  <p className="text-sm text-white/70 leading-relaxed">
                    <FaQuoteLeft className="text-[8px] text-aurora-cyan/30 inline mr-1.5 -mt-1" />
                    {coachMsg}
                  </p>
                ) : (
                  <button
                    onClick={getCoachCheckIn}
                    disabled={loadingCoach}
                    className="text-sm text-white/40 hover:text-aurora-cyan transition-colors flex items-center gap-1.5"
                  >
                    {loadingCoach ? <FaSpinner className="animate-spin text-xs" /> : <FaLightbulb className="text-xs" />}
                    {loadingCoach ? 'Thinking...' : "Get today's coach check-in"}
                  </button>
                )}
              </div>
              {coachMsg && (
                <button onClick={() => { setCoachMsg(''); getCoachCheckIn(); }} className="text-white/20 hover:text-white/50 transition-colors shrink-0" title="Refresh">
                  <FaRedo className="text-[10px]" />
                </button>
              )}
            </div>
          </div>

          {/* Day Cards */}
          <div className="space-y-4">
            {journey.days?.map((day, di) => {
              const dayPct = getDayProgress(di);
              const isDayComplete = dayPct === 100;
              const isCurrent = di === currentDay;
              const isLocked = di > currentDay;
              const bonusKey = `${di}-bonus`;
              const bonusDone = completedTasks[bonusKey];

              return (
                <div
                  key={di}
                  className={`glass rounded-2xl overflow-hidden transition-all ${
                    isDayComplete ? 'border-aurora-blue/20' : isCurrent ? 'border-aurora-cyan/20' : ''
                  } ${isLocked ? 'opacity-50' : ''}`}
                >
                  <div className={`p-5 ${isCurrent ? 'bg-aurora-cyan/[0.03]' : ''}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                        isDayComplete
                          ? 'bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink text-white'
                          : isCurrent
                          ? 'bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900'
                          : 'bg-white/5 border border-white/10 text-white/20'
                      }`}>
                        {isDayComplete ? <FaCheck /> : `D${day.day || di + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-sm">{day.theme}</h3>
                          {isCurrent && !isDayComplete && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-aurora-cyan/15 text-aurora-cyan uppercase">Today</span>
                          )}
                          {isDayComplete && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-aurora-blue/15 text-aurora-blue uppercase">Done</span>
                          )}
                        </div>
                        {day.coachNote && (
                          <p className="text-white/30 text-xs mt-0.5 italic">&ldquo;{day.coachNote}&rdquo;</p>
                        )}
                      </div>
                      <span className="text-xs text-white/20 shrink-0">{dayPct}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden mt-2">
                      <div className="h-full rounded-full bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink transition-all duration-500" style={{ width: `${dayPct}%` }} />
                    </div>
                  </div>

                  {!isLocked && (
                    <div className="px-5 pb-5 space-y-2">
                      {day.missions?.map((mission, mi) => {
                        const tKey = `${di}-${mi}`;
                        const done = completedTasks[tKey];
                        const mType = mission.type || 'learn';
                        const style = typeStyles[mType] || typeStyles.learn;
                        const Icon = style.icon;

                        return (
                          <button
                            key={mi}
                            onClick={() => toggleTask(di, mi, mission.xp || 10)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                              done ? 'bg-aurora-blue/5 border border-aurora-blue/15' : 'bg-white/[0.02] border border-white/5 hover:bg-white/5'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              done ? 'bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink text-white' : 'border border-white/10 text-white/20'
                            }`}>
                              {done ? <FaCheck className="text-[10px]" /> : <span className="text-[10px]">{mi + 1}</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-medium ${done ? 'text-aurora-blue line-through opacity-60' : 'text-white/80'}`}>{mission.title}</span>
                                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${style.bg} ${style.color}`}>
                                  <Icon className="text-[8px]" /> {mType}
                                </span>
                              </div>
                              <p className="text-white/30 text-xs mt-0.5">{mission.description}</p>
                            </div>
                            <span className={`text-[10px] font-bold shrink-0 mt-1 ${done ? 'text-aurora-blue/60' : 'text-white/15'}`}>+{mission.xp || 10}xp</span>
                          </button>
                        );
                      })}

                      {day.bonusMission && (
                        <button
                          onClick={() => toggleTask(di, null, day.bonusMission.xp || 15, true)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all border-dashed ${
                            bonusDone ? 'bg-aurora-cyan/5 border border-aurora-cyan/15' : 'bg-white/[0.01] border border-white/5 hover:bg-white/5'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            bonusDone ? 'bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900' : 'border border-white/10 text-aurora-cyan/30'
                          }`}>
                            {bonusDone ? <FaCheck className="text-[10px]" /> : <FaStar className="text-[9px]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${bonusDone ? 'text-aurora-cyan line-through opacity-60' : 'text-aurora-cyan/60'}`}>{day.bonusMission.title}</span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-aurora-cyan/10 text-aurora-cyan">Bonus</span>
                            </div>
                            <p className="text-white/25 text-xs mt-0.5">{day.bonusMission.description}</p>
                          </div>
                          <span className={`text-[10px] font-bold shrink-0 mt-1 ${bonusDone ? 'text-aurora-cyan/60' : 'text-white/15'}`}>+{day.bonusMission.xp || 15}xp</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Milestones */}
          {journey.milestones?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FaTrophy className="text-aurora-cyan text-xs" /> Milestones
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {journey.milestones.map((m, i) => {
                  const reached = currentDay >= m.day;
                  return (
                    <div key={i} className={`glass rounded-xl p-4 min-w-[200px] shrink-0 transition-all ${reached ? 'border-aurora-cyan/20 bg-aurora-cyan/5' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${reached ? 'bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900' : 'bg-white/5 text-white/20'}`}>
                        {reached ? <FaTrophy className="text-xs" /> : <FaFlag className="text-xs" />}
                      </div>
                      <div className="text-xs text-white/20 mb-1">Day {m.day}</div>
                      <div className={`text-sm font-bold ${reached ? 'text-aurora-cyan' : 'text-white/40'}`}>{m.title}</div>
                      <div className="text-xs text-white/25 mt-0.5">{m.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Journey Complete */}
          {allComplete && (
            <div className="mt-8 glass rounded-2xl p-8 text-center border border-aurora-cyan/20 bg-aurora-cyan/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/5 to-aurora-blue/5 animate-pulse" />
              <div className="relative">
                <div className="text-5xl mb-3">🏆</div>
                <h3 className="text-2xl font-black text-white mb-2">Journey Complete!</h3>
                <p className="text-white/40 text-sm mb-1">You earned <span className="text-aurora-cyan font-bold">{xp} XP</span> with a <span className="text-aurora-blue font-bold">{streak}-day streak</span>.</p>
                <p className="text-white/30 text-xs mb-5">Every mission, every day — you showed up and delivered.</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setJourney(null); setGoal(''); setCoachMsg(''); }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:scale-105 transition-transform">
                    New Journey
                  </button>
                  <Link to="/practice" className="px-6 py-3 rounded-xl glass text-white/60 hover:text-white text-sm font-semibold hover:bg-white/10 transition-all">
                    Practice Skills
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milestone Celebration Overlay */}
      {showCelebration && celebrationRef.current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-3xl p-10 text-center max-w-sm mx-auto border border-aurora-cyan/30 shadow-2xl shadow-aurora-cyan/10 animate-bounce-in">
            <div className="text-5xl mb-4">🎯</div>
            <div className="text-xs text-aurora-cyan uppercase tracking-widest mb-2 font-bold">Milestone Reached</div>
            <h3 className="text-2xl font-black text-white mb-2">{celebrationRef.current.title}</h3>
            <p className="text-white/40 text-sm">{celebrationRef.current.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyPage;
