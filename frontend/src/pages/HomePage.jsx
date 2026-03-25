import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaArrowRight, FaBrain, FaRocket, FaMagic, FaAtom, FaUtensils, FaCut, FaRunning, FaGuitar, FaPalette, FaChess, FaRoute, FaDumbbell, FaGem } from 'react-icons/fa';
import TutorialCard from '../components/TutorialCard';
import TypewriterText from '../components/TypewriterText';

const HomePage = () => {
  const { tutorials, stats, loading, setChatOpen, isLoggedIn, showToast } = useApp();
  const featured = tutorials.slice(0, 3);

  const features = [
    {
      icon: <FaBrain className="text-2xl" />,
      title: 'Smart Learning Mentor',
      desc: 'Chat with Lumina — get instant explanations, personalized guidance, and answers to any learning question.',
      gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink',
    },
    {
      icon: <FaMagic className="text-2xl" />,
      title: 'Tutorial Studio',
      desc: 'Type any topic and get a full step-by-step tutorial generated instantly. Great for quick, focused learning on a single subject.',
      gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink',
      link: '/ai-lab',
    },
    {
      icon: <FaAtom className="text-2xl" />,
      title: 'Concept Explainer',
      desc: 'Stuck on a step? Highlight any concept and get it broken down in simple terms with analogies.',
      gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink',
    },
    {
      icon: <FaRoute className="text-2xl" />,
      title: '7-Day Journey',
      desc: 'Set a learning goal and get a structured 7-day mission plan with daily tasks, XP, streaks, and coach check-ins.',
      gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink',
      link: '/journey',
    },
    {
      icon: <FaDumbbell className="text-2xl" />,
      title: 'Practice Simulator',
      desc: 'Test your knowledge with quizzes, real-world scenarios, and flashcards on any topic. Timed sessions available.',
      gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink',
      link: '/practice',
    },
    {
      icon: <FaGem className="text-2xl" />,
      title: 'Dream Builder',
      desc: 'Describe your dream career or big project and get a full roadmap with required skills, milestones, resources, and habits.',
      gradient: 'from-aurora-cyan via-aurora-blue to-aurora-pink',
      link: '/dream-builder',
    },
  ];

  const categories = [
    { name: 'Cooking', icon: <FaUtensils />, color: 'from-orange-500/20 to-red-500/20 border-orange-500/20' },
    { name: 'Crafts', icon: <FaCut />, color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/20' },
    { name: 'Fitness', icon: <FaRunning />, color: 'from-green-500/20 to-emerald-500/20 border-green-500/20' },
    { name: 'Music', icon: <FaGuitar />, color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/20' },
    { name: 'Art', icon: <FaPalette />, color: 'from-pink-500/20 to-rose-500/20 border-pink-500/20' },
    { name: 'Games', icon: <FaChess />, color: 'from-purple-500/20 to-violet-500/20 border-purple-500/20' },
  ];

  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative pt-20 pb-28 px-4 overflow-hidden">
        {/* Extra glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-aurora-cyan/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-aurora-pink/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm">
            <span className="w-2 h-2 rounded-full bg-aurora-green animate-pulse" />
            <span className="text-white/60">Smart Learning Platform</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <TypewriterText
              speed={50}
              delayBetween={600}
              texts={[
                { text: 'Learn Anything.', className: 'text-white' },
                { text: 'Master Everything.', className: 'gradient-text' },
              ]}
            />
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover tutorials on any topic, track your progress, and build real skills — guided by Lumina, your personal learning companion.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/ai-lab"
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-bold text-lg shadow-2xl shadow-aurora-cyan/20 hover:shadow-aurora-cyan/40 transition-all hover:scale-105"
            >
              <FaRocket className="transition-transform group-hover:-translate-y-0.5" />
              Open Studio
            </Link>
            <Link
              to="/tutorials"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl glass text-white/80 font-semibold hover:text-white hover:bg-white/10 transition-all"
            >
              Explore Tutorials
              <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: stats?.totalTutorials || '...', label: 'Tutorials' },
              { value: stats?.totalCategories || '...', label: 'Categories' },
              { value: stats?.totalViews || 0, label: 'Total Views' },
              { value: '∞', label: 'Possible Topics' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black gradient-text mb-1">{s.value}</div>
                <div className="text-xs text-white/30 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI FEATURES ===== */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Built Different From The Ground Up
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Intelligence is woven into every part of the experience. It's not a feature — it's the foundation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Card = (
                <div
                  key={i}
                  className="group glass rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                  {f.link && (
                    <span className="inline-flex items-center gap-1 text-aurora-cyan text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <FaArrowRight className="text-[8px]" />
                    </span>
                  )}
                </div>
              );
              return f.link ? <Link key={i} to={f.link}>{Card}</Link> : Card;
            })}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Skill Domains</h2>
            <Link to="/tutorials" className="text-sm text-aurora-cyan hover:text-white transition-colors flex items-center gap-1">
              View all <FaArrowRight className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c, i) => (
              <Link
                key={i}
                to={`/tutorials?category=${c.name.toLowerCase()}`}
                className={`group flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${c.color} border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1`}
              >
                <span className="text-2xl group-hover:scale-125 transition-transform text-white/70 group-hover:text-white">{c.icon}</span>
                <span className="text-sm font-medium text-white/70 group-hover:text-white">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED TUTORIALS ===== */}
      {featured.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Latest Tutorials</h2>
              <Link to="/tutorials" className="text-sm text-aurora-cyan hover:text-white transition-colors flex items-center gap-1">
                See all <FaArrowRight className="text-xs" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featured.map(t => <TutorialCard key={t._id} tutorial={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-aurora-cyan/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-aurora-pink/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Learn Something New?
              </h2>
              <p className="text-white/40 mb-8">
                Ask Lumina to create a tutorial on literally anything — from sourdough bread to quantum physics.
              </p>
              <button
                onClick={() => {
                  if (!isLoggedIn) { showToast('Sign in to chat with Lumina', 'warning'); return; }
                  setChatOpen(true);
                }}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-white font-bold text-lg shadow-2xl hover:shadow-aurora-cyan/30 transition-all hover:scale-105"
              >
                <FaBrain />
                Talk to Lumina
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/20">
          <span className="gradient-text font-bold">Lumina</span>
          <span>Learn Smarter, Not Harder</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;