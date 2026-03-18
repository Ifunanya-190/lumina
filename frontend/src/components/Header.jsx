import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaBrain, FaBars, FaTimes, FaUser } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/tutorials', label: 'Explore' },
  { to: '/ai-lab', label: 'AI Lab' },
];

const Header = () => {
  const { pathname } = useLocation();
  const { setChatOpen, isLoggedIn, user, showToast } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  return (
    <header className={`sticky top-0 z-40 transition-all duration-500 ${scrolled ? 'py-0' : 'py-1'}`}>
      <div className={`glass border-b border-white/5 transition-all duration-500 ${scrolled ? 'backdrop-blur-2xl bg-nebula-900/80' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="logo-bounce">
                <span className="text-xl font-bold gradient-text">Lumina</span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40 -mt-1">Learn & Create</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => {
                const active = pathname === to || (to !== '/' && pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'text-aurora-cyan'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-blue" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Chat toggle */}
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    showToast('Sign in to chat with Lumina', 'warning');
                    return;
                  }
                  setChatOpen(true);
                }}
                className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-aurora-blue to-aurora-pink text-white text-sm font-semibold shadow-lg hover:shadow-aurora-blue/30 transition-all hover:scale-105 active:scale-95"
              >
                <FaBrain className="text-sm" />
                <span className="hidden sm:inline">Ask Lumina</span>
              </button>

              {/* Auth */}
              {isLoggedIn ? (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-aurora-cyan to-aurora-blue flex items-center justify-center text-white text-xs">
                    <FaUser />
                  </div>
                  <span className="hidden sm:inline text-xs font-medium">{user?.display_name || user?.username}</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <FaUser className="text-xs" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg glass text-white/70 hover:text-white transition-colors"
              >
                {mobileOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 pb-4 space-y-1">
            {navLinks.map(({ to, label }) => {
              const active = pathname === to || (to !== '/' && pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active ? 'text-aurora-cyan bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
