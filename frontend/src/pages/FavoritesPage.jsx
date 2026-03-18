import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TutorialCard from '../components/TutorialCard';
import { FaBookmark, FaArrowLeft } from 'react-icons/fa';

const FavoritesPage = () => {
  const { favorites, isLoggedIn } = useApp();

  if (!isLoggedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-aurora-gold/20 to-orange-400/20 flex items-center justify-center mx-auto mb-6">
          <FaBookmark className="text-3xl text-aurora-gold" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Sign In to View Favorites</h1>
        <p className="text-white/40 mb-6">Save tutorials you love and access them anytime.</p>
        <Link to="/auth" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-aurora-blue to-aurora-pink text-white font-semibold hover:shadow-lg transition-all">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/profile" className="text-white/40 hover:text-aurora-cyan transition-colors">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Your Favorites</h1>
          <p className="text-white/40 text-sm">{favorites.length} saved tutorial{favorites.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(t => <TutorialCard key={t._id} tutorial={t} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📑</div>
          <h3 className="text-xl font-semibold text-white/60 mb-2">No favorites yet</h3>
          <p className="text-white/30 mb-6">Browse tutorials and save the ones you love!</p>
          <Link
            to="/tutorials"
            className="px-6 py-2.5 rounded-xl glass text-sm text-white/60 hover:text-white transition-colors"
          >
            Explore Tutorials
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
