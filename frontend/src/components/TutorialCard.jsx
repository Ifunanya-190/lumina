import { Link } from 'react-router-dom';
import { FaClock, FaHeart, FaEye, FaBookmark, FaRegBookmark, FaUtensils, FaCut, FaRunning, FaGuitar, FaPalette, FaChess, FaLaptopCode, FaFlask, FaLanguage, FaLeaf, FaBook } from 'react-icons/fa';
import { useApp } from '../context/AppContext';

const diffColors = {
  beginner: 'from-aurora-green to-emerald-400 text-nebula-900',
  intermediate: 'from-aurora-gold to-orange-400 text-nebula-900',
  advanced: 'from-aurora-pink to-red-400 text-white',
};

const catIcons = {
  cooking: <FaUtensils />, crafts: <FaCut />, fitness: <FaRunning />, music: <FaGuitar />,
  art: <FaPalette />, games: <FaChess />, technology: <FaLaptopCode />, science: <FaFlask />,
  language: <FaLanguage />, lifestyle: <FaLeaf />,
};

const TutorialCard = ({ tutorial }) => {
  const { likeTutorial, toggleFavorite, isFavorited } = useApp();
  const colors = diffColors[tutorial.difficulty] || diffColors.beginner;

  return (
    <Link
      to={`/tutorial/${tutorial._id}`}
      className="group block glass rounded-2xl overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-aurora-blue/10"
    >
      {/* Top gradient accent */}
      <div className={`h-1 bg-gradient-to-r ${colors}`} />

      <div className="p-5">
        {/* Top row: category + difficulty + ai badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg text-white/50">{catIcons[tutorial.category] || <FaBook />}</span>
            <span className="text-xs text-white/40 uppercase tracking-wider">{tutorial.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gradient-to-r ${colors}`}>
              {tutorial.difficulty}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-aurora-cyan transition-colors mb-2 line-clamp-2">
          {tutorial.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/40 leading-relaxed mb-4 line-clamp-2">
          {tutorial.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs text-white/30">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FaClock className="text-aurora-blue" /> {tutorial.duration}
            </span>
            {tutorial.views > 0 && (
              <span className="flex items-center gap-1">
                <FaEye className="text-aurora-cyan" /> {tutorial.views}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tutorial._id); }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all ${
                isFavorited(tutorial._id) ? 'text-aurora-gold' : 'text-white/30 hover:text-aurora-gold hover:bg-white/5'
              }`}
            >
              {isFavorited(tutorial._id) ? <FaBookmark /> : <FaRegBookmark />}
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); likeTutorial(tutorial._id); }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5 text-white/30 hover:text-aurora-pink transition-all"
            >
              <FaHeart /> {tutorial.likes || 0}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TutorialCard;