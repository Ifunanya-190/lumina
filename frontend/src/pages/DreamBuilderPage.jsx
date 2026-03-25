import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaRocket, FaSpinner, FaStar, FaRoute, FaCheck, FaClock, FaArrowRight, FaRedo, FaGem, FaLightbulb, FaLayerGroup, FaSeedling, FaPlay } from 'react-icons/fa';

const DreamBuilderPage = () => {
  const { isLoggedIn, api, showToast, requireAuth } = useApp();
  const [dream, setDream] = useState('');
  const [timeframe, setTimeframe] = useState('6months');
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState(null);

  const timeframes = [
    { value: '1month', label: '1 Month', desc: 'Sprint mode' },
    { value: '3months', label: '3 Months', desc: 'Focused push' },
    { value: '6months', label: '6 Months', desc: 'Balanced pace' },
    { value: '1year', label: '1 Year', desc: 'Deep mastery' },
  ];

  const dreamIdeas = [
    'Build and launch my own SaaS product',
    'Become a professional photographer',
    'Open a small bakery business',
    'Create and sell an online course',
    'Become a freelance graphic designer',
    'Write and publish a novel',
    'Start a YouTube channel that earns income',
    'Transition into a data science career',
  ];

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

  const generatePlan = async () => {
    if (!dream.trim()) return;
    if (!requireAuth('use Dream Builder')) return;
    setGenerating(true);
    setPlan(null);
    try {
      const { data } = await api().post('/ai/chat', {
        message: `I want to achieve this dream: "${dream}" within a timeframe of ${timeframe.replace('months', ' months').replace('year', ' year').replace('month', ' month')}.

Create a comprehensive dream-to-reality plan. Return ONLY a valid JSON object (no markdown, no code fences, no extra text):
{
  "dreamTitle": "inspiring title",
  "summary": "motivational summary of the plan",
  "skills": [{"name":"skill name","level":"beginner|intermediate|advanced","priority":"critical|important|nice-to-have","description":"why this skill matters"}],
  "milestones": [{"title":"milestone","timeframe":"when","description":"what to achieve","tasks":["task1","task2","task3"]}],
  "resources": [{"type":"course|book|tool|community","name":"resource name","description":"how it helps"}],
  "weeklyHabits": ["habit1","habit2","habit3"],
  "quickWins": ["quick win 1","quick win 2","quick win 3"]
}
Generate 5-7 skills, 4-6 milestones, 4-5 resources, 3-4 weekly habits, and 3 quick wins. Make it actionable and inspiring. ONLY output JSON.`,
        context: 'dream_builder'
      });

      const parsed = extractJSON(data.reply);
      if (parsed && parsed.milestones) {
        setPlan(parsed);
      } else {
        showToast('Received incomplete data. Please try again.', 'warning');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate your dream plan. Try again.';
      showToast(msg, 'error');
    }
    setGenerating(false);
  };

  const priorityColor = { critical: 'from-aurora-cyan to-amber-400 text-nebula-900', important: 'from-aurora-blue to-emerald-400 text-nebula-900', 'nice-to-have': 'from-white/20 to-white/10 text-white/60' };
  const levelDots = { beginner: 1, intermediate: 2, advanced: 3 };
  const resourceIcon = { course: <FaLayerGroup />, book: <FaLightbulb />, tool: <FaRocket />, community: <FaStar /> };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4 text-sm">
          <FaGem className="text-aurora-cyan" />
          <span className="text-white/60">Turn Dreams Into Plans</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
          Dream <span className="gradient-text">Builder</span>
        </h1>
        <p className="text-white/40 max-w-xl mx-auto">
          Describe your dream career or big project. Lumina creates a full roadmap with skills, milestones, resources, and weekly habits.
        </p>
      </div>

      {/* Builder Form */}
      {!plan && !generating && (
        <div className="glass rounded-3xl p-8 sm:p-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink flex items-center justify-center text-nebula-900">
              <FaRocket />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">What's your dream?</h2>
              <p className="text-white/30 text-xs">Think big — the more specific, the better the plan.</p>
            </div>
          </div>

          <textarea
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            placeholder="e.g. I want to build a profitable online business selling handmade leather goods, with a beautiful website and consistent monthly income..."
            className="w-full h-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-aurora-cyan/50 resize-none mb-4"
          />

          {/* Timeframe */}
          <h3 className="text-sm font-semibold text-white/40 mb-2">Timeframe</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            {timeframes.map(t => (
              <button
                key={t.value}
                onClick={() => setTimeframe(t.value)}
                className={`p-3 rounded-xl border text-center transition-all ${
                  timeframe === t.value
                    ? 'border-aurora-cyan/30 bg-aurora-cyan/5'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                }`}
              >
                <span className="text-xs font-bold text-white block">{t.label}</span>
                <span className="text-[10px] text-white/30">{t.desc}</span>
              </button>
            ))}
          </div>

          <button
            onClick={generatePlan}
            disabled={!dream.trim()}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:shadow-lg hover:shadow-aurora-cyan/20 transition-all hover:scale-[1.02] disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <FaGem /> Build My Dream Plan
          </button>

          <div className="mt-6 flex flex-wrap gap-2">
            <p className="w-full text-xs text-white/20 mb-1">Dream ideas:</p>
            {dreamIdeas.map((d, i) => (
              <button key={i} onClick={() => setDream(d)} className="px-3 py-1.5 rounded-full glass text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all">{d}</button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {generating && (
        <div className="glass rounded-3xl p-12 text-center max-w-lg mx-auto">
          <div className="relative inline-block mb-4">
            <FaGem className="text-4xl text-aurora-cyan" />
            <div className="absolute -inset-3 rounded-full border-2 border-aurora-cyan/20 animate-ping" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Building your dream plan...</h3>
          <p className="text-white/30 text-sm">Analyzing skills, creating milestones, finding resources</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-aurora-cyan animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
      )}

      {/* Dream Plan Result */}
      {plan && !generating && (
        <div className="space-y-6">
          {/* Plan Header */}
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-white mb-2">{plan.dreamTitle || 'Your Dream Plan'}</h2>
                <p className="text-white/40 text-sm leading-relaxed max-w-2xl">{plan.summary || ''}</p>
              </div>
              <button onClick={() => { setPlan(null); setDream(''); }} className="px-4 py-2 rounded-xl glass text-xs text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 shrink-0">
                <FaRedo className="text-[10px]" /> New Dream
              </button>
            </div>
          </div>

          {/* Quick Wins */}
          {plan.quickWins?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                <FaSeedling className="text-aurora-cyan" /> Quick Wins — Start Today
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {plan.quickWins.map((w, i) => (
                  <div key={i} className="p-4 rounded-xl bg-aurora-cyan/5 border border-aurora-cyan/10">
                    <span className="text-aurora-cyan text-lg font-bold mr-2">{i + 1}.</span>
                    <span className="text-white/70 text-sm">{w}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Required */}
          {plan.skills?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                <FaStar className="text-aurora-cyan" /> Skills to Develop
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {plan.skills.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-semibold text-sm">{s.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gradient-to-r ${priorityColor[s.priority] || priorityColor.important}`}>
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-white/30 text-xs mb-2">{s.description}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map(d => (
                        <div key={d} className={`w-2 h-2 rounded-full ${d <= (levelDots[s.level] || 1) ? 'bg-aurora-cyan' : 'bg-white/10'}`} />
                      ))}
                      <span className="text-[10px] text-white/20 ml-1">{s.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Milestones Timeline */}
          {plan.milestones?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-6">
                <FaRoute className="text-aurora-cyan" /> Your Roadmap
              </h3>
              <div className="space-y-0">
                {plan.milestones.map((m, i) => (
                  <div key={i} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aurora-cyan via-aurora-blue to-aurora-pink flex items-center justify-center text-nebula-900 text-xs font-black shrink-0">
                        {i + 1}
                      </div>
                      {i < plan.milestones.length - 1 && <div className="w-0.5 flex-1 bg-white/5 my-1" />}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-bold">{m.title}</h4>
                        {m.timeframe && (
                          <span className="text-[10px] text-aurora-cyan flex items-center gap-1"><FaClock className="text-[8px]" />{m.timeframe}</span>
                        )}
                      </div>
                      <p className="text-white/40 text-xs mb-3">{m.description}</p>
                      {m.tasks?.length > 0 && (
                        <div className="space-y-1.5">
                          {m.tasks.map((task, ti) => (
                            <div key={ti} className="flex items-start gap-2 text-xs text-white/50">
                              <FaCheck className="text-aurora-cyan/40 mt-0.5 text-[10px] shrink-0" /> {task}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Habits + Resources */}
          <div className="grid sm:grid-cols-2 gap-6">
            {plan.weeklyHabits?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-md font-bold text-white mb-4">
                  <FaClock className="text-aurora-cyan text-sm" /> Weekly Habits
                </h3>
                <div className="space-y-2">
                  {plan.weeklyHabits.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <FaCheck className="text-aurora-cyan mt-0.5 text-xs shrink-0" />
                      <span className="text-white/60 text-sm">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {plan.resources?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="flex items-center gap-2 text-md font-bold text-white mb-4">
                  <FaLightbulb className="text-aurora-cyan text-sm" /> Recommended Resources
                </h3>
                <div className="space-y-2">
                  {plan.resources.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-aurora-cyan/10 flex items-center justify-center text-aurora-cyan text-xs shrink-0">
                        {resourceIcon[r.type] || <FaStar />}
                      </div>
                      <div>
                        <span className="text-white text-sm font-medium">{r.name}</span>
                        <p className="text-white/30 text-xs">{r.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="glass rounded-2xl p-8 text-center border border-aurora-cyan/10 bg-aurora-cyan/5">
            <h3 className="text-xl font-bold text-white mb-2">Ready to Start?</h3>
            <p className="text-white/40 text-sm mb-6">Turn this plan into action. Start with the quick wins and build momentum.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/journey" className="px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
                <FaRoute /> Create Learning Journey
              </Link>
              <Link to="/practice" className="px-6 py-3 rounded-xl glass text-white/60 text-sm font-semibold hover:text-white hover:bg-white/10 transition-all flex items-center gap-2">
                <FaPlay className="text-xs" /> Practice Skills
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DreamBuilderPage;
