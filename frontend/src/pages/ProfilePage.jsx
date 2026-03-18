import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaTrophy, FaFire, FaStar, FaArrowRight, FaSeedling, FaBolt, FaSignOutAlt, FaRedo, FaBookmark, FaUser, FaTimes } from 'react-icons/fa';

const levelInfo = {
  beginner: { icon: <FaSeedling />, color: 'from-aurora-green to-emerald-400', label: 'Beginner' },
  intermediate: { icon: <FaFire />, color: 'from-aurora-gold to-orange-400', label: 'Intermediate' },
  advanced: { icon: <FaBolt />, color: 'from-aurora-pink to-red-400', label: 'Advanced' },
};

const ProfilePage = () => {
  const { user, isLoggedIn, logout, userProgress, getRecommended, favorites, cancelProgress, showToast } = useApp();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [recLevel, setRecLevel] = useState('');
  const [leveledUp, setLeveledUp] = useState(false);
  const [cancelId, setCancelId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth'); return; }
    getRecommended().then(data => {
      setRecommended(data.recommended || []);
      setRecLevel(data.userLevel || '');
      setLeveledUp(data.allCurrentLevelDone || false);
    }).catch(() => {});
  }, [isLoggedIn, navigate, getRecommended]);

  if (!isLoggedIn || !user) return null;

  const completed = userProgress.filter(p => p.completed);
  const inProgress = userProgress.filter(p => !p.completed);
  const info = levelInfo[user.skill_level] || levelInfo.beginner;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile Header */}
      <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white text-3xl shadow-lg shrink-0`}>
            <FaUser />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{user.display_name || user.username}</h1>
            <p className="text-white/40 text-sm">@{user.username}</p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${info.color} text-nebula-900`}>
                {info.icon} {info.label}
              </span>
              <span className="flex items-center gap-1 text-sm text-aurora-gold">
                <FaStar className="text-xs" /> {user.xp || user.stats?.totalXp || 0} XP
              </span>
              {user.streak_days > 0 && (
                <span className="flex items-center gap-1 text-sm text-aurora-pink">
                  <FaFire className="text-xs" /> {user.streak_days} day streak
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/favorites"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-white/50 hover:text-aurora-gold hover:bg-aurora-gold/10 transition-all"
            >
              <FaBookmark className="text-xs" /> Favorites
            </Link>
            <Link
              to="/assessment"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <FaRedo className="text-xs" /> Change Level
            </Link>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-white/50 hover:text-aurora-pink hover:bg-aurora-pink/10 transition-all"
            >
              <FaSignOutAlt className="text-xs" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
        {[
          { label: 'Completed', value: completed.length, color: 'text-aurora-green' },
          { label: 'In Progress', value: inProgress.length, color: 'text-aurora-blue' },
          { label: 'Total XP', value: user.xp || user.stats?.totalXp || 0, color: 'text-aurora-gold' },
          { label: 'Favorites', value: favorites.length, color: 'text-aurora-cyan' },
          { label: 'Achievements', value: user.achievements?.length || 0, color: 'text-aurora-pink' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-white/30 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Level Up Banner */}
      {leveledUp && (
        <div className="glass rounded-2xl p-5 mb-6 border border-aurora-gold/20 bg-aurora-gold/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aurora-gold to-orange-400 flex items-center justify-center text-white">
              <FaTrophy />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Ready to Level Up!</h3>
              <p className="text-white/40 text-xs">
                You completed all {user.skill_level} tutorials. We're now showing you {recLevel} content!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {user.achievements && user.achievements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Achievements</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.achievements.map((a, i) => (
              <div key={i} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-aurora-gold to-aurora-pink flex items-center justify-center text-white">
                  <FaTrophy />
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold">{a.title}</h4>
                  <p className="text-white/30 text-xs">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Continue Learning</h2>
          <div className="space-y-3">
            {inProgress.map((p, i) => {
              const pct = p.total_steps > 0 ? Math.round((p.current_step / p.total_steps) * 100) : 0;
              const showCancel = cancelId === p.tutorial_id;
              return (
                <div
                  key={i}
                  className="glass rounded-xl p-4 hover:bg-white/5 transition-all group relative"
                  onMouseLeave={() => setCancelId(null)}
                >
                  <Link to={`/tutorial/${p.tutorial_id}`} className="block">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white text-sm font-semibold group-hover:text-aurora-cyan transition-colors pr-8">{p.title}</h4>
                      {/* Desktop: hover swaps %, Mobile: tap swaps */}
                      <span
                        className={`text-xs text-white/30 cursor-pointer ${showCancel ? 'hidden' : 'group-hover:hidden'}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCancelId(p.tutorial_id); }}
                      >
                        {pct}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          cancelProgress(p.tutorial_id).then(() => { setCancelId(null); showToast('Tutorial removed from your list', 'info'); }).catch(() => showToast('Failed to remove', 'error'));
                        }}
                        className={`w-7 h-7 rounded-lg items-center justify-center text-white/30 hover:text-aurora-pink hover:bg-aurora-pink/10 transition-all ${showCancel ? 'flex' : 'hidden group-hover:flex'}`}
                        title="Remove from learning"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-blue transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommended Next */}
      {recommended.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Recommended For You</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map((t, i) => (
              <Link key={i} to={`/tutorial/${t._id}`} className="glass rounded-xl p-4 hover:bg-white/5 transition-all group">
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-2 bg-gradient-to-r ${
                  levelInfo[t.difficulty]?.color || 'from-aurora-cyan to-aurora-blue'
                } text-nebula-900`}>{t.difficulty}</span>
                <h4 className="text-white text-sm font-semibold group-hover:text-aurora-cyan transition-colors">{t.title}</h4>
                <p className="text-white/30 text-xs mt-1 line-clamp-2">{t.description}</p>
                <span className="inline-flex items-center gap-1 text-aurora-cyan text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <FaArrowRight className="text-[8px]" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-white mb-4">Completed ({completed.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completed.map((p, i) => (
              <Link key={i} to={`/tutorial/${p.tutorial_id}`} className="glass rounded-xl p-4 bg-aurora-green/5 border-aurora-green/10 flex items-center gap-3 group hover:bg-aurora-green/10 transition-all">
                <span className="text-aurora-green text-lg">✓</span>
                <div>
                  <h4 className="text-white/80 text-sm font-semibold">{p.title}</h4>
                  <span className="text-xs text-white/20">+{p.xp_earned || 0} XP</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
