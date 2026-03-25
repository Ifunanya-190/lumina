import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaHeart, FaEye, FaBookmark, FaRegBookmark, FaTimes, FaUtensils, FaCut, FaRunning, FaGuitar, FaPalette, FaChess, FaLaptopCode, FaFlask, FaLanguage, FaLeaf, FaBook } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import ConfirmDialog from './ConfirmDialog';

const diffColors = {
  beginner: 'from-aurora-green to-emerald-400 text-nebula-900',
  intermediate: 'from-aurora-cyan via-aurora-blue to-aurora-pink text-white',
  advanced: 'from-aurora-pink to-red-400 text-white',
};

const catIcons = {
  cooking: <FaUtensils />, crafts: <FaCut />, fitness: <FaRunning />, music: <FaGuitar />,
  art: <FaPalette />, games: <FaChess />, technology: <FaLaptopCode />, science: <FaFlask />,
  language: <FaLanguage />, lifestyle: <FaLeaf />,
};

const TutorialCard = ({ tutorial }) => {
  const { likeTutorial, toggleFavorite, isFavorited, deleteTutorial, isLoggedIn } = useApp();
  const colors = diffColors[tutorial.difficulty] || diffColors.beginner;
  const [showDelete, setShowDelete] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setConfirmOpen(false);
    await deleteTutorial(tutorial._id);
  };

  return (
    <>
    <Link
      to={`/tutorial/${tutorial._id}`}
      className="group block glass rounded-2xl overflow-hidden transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-aurora-cyan/10 relative"
      onClick={() => setShowDelete(false)}
    >
        {/* Delete button */}
        {isLoggedIn && (
        <button
          onClick={handleDelete}
          onTouchStart={(e) => { e.stopPropagation(); setShowDelete(true); }}
          className="absolute top-3 right-3 z-20 w-7 h-7 rounded-lg bg-nebula-900/80 border border-white/10 flex items-center justify-center text-white/40 hover:text-aurora-pink hover:bg-aurora-pink/20 hover:border-aurora-pink/30 transition-all duration-200 backdrop-blur-sm opacity-70 hover:opacity-100"
          title="Delete tutorial"
        >
          <FaTimes className="text-xs" />
        </button>
      )}
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
              <FaClock className="text-aurora-cyan" /> {tutorial.duration}
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
                isFavorited(tutorial._id) ? 'text-aurora-cyan' : 'text-white/30 hover:text-aurora-cyan hover:bg-white/5'
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
    <ConfirmDialog
      open={confirmOpen}
      title="Delete Tutorial"
      message="Are you sure you want to delete this tutorial? This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Keep"
      variant="danger"
      onConfirm={confirmDelete}
      onCancel={() => setConfirmOpen(false)}
    />
    </>
  );
};

export default TutorialCard;