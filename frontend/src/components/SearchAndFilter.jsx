import { FaSearch, FaTimes } from 'react-icons/fa';

const categories = ['all', 'cooking', 'crafts', 'fitness', 'music', 'art', 'games', 'technology', 'science', 'lifestyle'];
const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

const SearchAndFilter = ({ filters, onFilterChange }) => {
  const hasActive = filters.search || filters.category !== 'all' || filters.difficulty !== 'all';

  return (
    <div className="glass rounded-2xl p-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
          <input
            type="text"
            placeholder="Search tutorials..."
            className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-aurora-blue/50 focus:ring-1 focus:ring-aurora-blue/30 transition-all"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
          {filters.search && (
            <button onClick={() => onFilterChange('search', '')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <FaTimes className="text-sm" />
            </button>
          )}
        </div>

        {/* Category */}
        <select
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-aurora-blue/50 appearance-none cursor-pointer min-w-[140px]"
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
        >
          {categories.map(c => (
            <option key={c} value={c} className="bg-nebula-900 text-white">
              {c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>

        {/* Difficulty */}
        <select
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-aurora-blue/50 appearance-none cursor-pointer min-w-[140px]"
          value={filters.difficulty}
          onChange={(e) => onFilterChange('difficulty', e.target.value)}
        >
          {difficulties.map(d => (
            <option key={d} value={d} className="bg-nebula-900 text-white">
              {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>

        {/* Clear */}
        {hasActive && (
          <button
            onClick={() => { onFilterChange('search', ''); onFilterChange('category', 'all'); onFilterChange('difficulty', 'all'); }}
            className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      {/* Active filter tags */}
      {hasActive && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aurora-blue/10 text-aurora-cyan text-xs border border-aurora-blue/20">
              "{filters.search}"
              <button onClick={() => onFilterChange('search', '')}><FaTimes className="text-[10px]" /></button>
            </span>
          )}
          {filters.category !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aurora-pink/10 text-aurora-pink text-xs border border-aurora-pink/20">
              {filters.category}
              <button onClick={() => onFilterChange('category', 'all')}><FaTimes className="text-[10px]" /></button>
            </span>
          )}
          {filters.difficulty !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-aurora-green/10 text-aurora-green text-xs border border-aurora-green/20">
              {filters.difficulty}
              <button onClick={() => onFilterChange('difficulty', 'all')}><FaTimes className="text-[10px]" /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;