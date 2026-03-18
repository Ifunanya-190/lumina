import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import TutorialCard from '../components/TutorialCard';
import SearchAndFilter from '../components/SearchAndFilter';

const TutorialsPage = () => {
  const { tutorials, loading } = useApp();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: '',
    category: searchParams.get('category') || 'all',
    difficulty: 'all'
  });

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setFilters(f => ({ ...f, category: cat }));
  }, [searchParams]);

  // Client-side filtering
  const filtered = tutorials.filter(t => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!t.title.toLowerCase().includes(s) && !t.description.toLowerCase().includes(s) && !(t.tags || []).some(tag => tag.toLowerCase().includes(s)))
        return false;
    }
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.difficulty !== 'all' && t.difficulty !== filters.difficulty) return false;
    return true;
  });

  const handleFilterChange = (key, value) => setFilters(f => ({ ...f, [key]: value }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Explore Tutorials</h1>
        <p className="text-white/40">Discover skills across all levels and categories.</p>
      </div>

      {/* Filters */}
      <SearchAndFilter filters={filters} onFilterChange={handleFilterChange} />

      {/* Results info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-white/30">
          {filtered.length} tutorial{filtered.length !== 1 ? 's' : ''}
          {filters.search && <span className="text-aurora-cyan"> matching "{filters.search}"</span>}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass rounded-2xl h-64 shimmer" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => <TutorialCard key={t._id} tutorial={t} />)}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔭</div>
          <h3 className="text-xl font-semibold text-white/60 mb-2">No tutorials found</h3>
          <p className="text-white/30 mb-6">Try different filters or ask Lumina AI to create one!</p>
          <button
            onClick={() => setFilters({ search: '', category: 'all', difficulty: 'all' })}
            className="px-6 py-2.5 rounded-xl glass text-sm text-white/60 hover:text-white transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default TutorialsPage;
