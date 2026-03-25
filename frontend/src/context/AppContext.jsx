import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');
const AppContext = createContext();

function getStoredToken() {
  try { return localStorage.getItem('lumina_token'); } catch { return null; }
}
function getStoredUser() {
  try { const u = localStorage.getItem('lumina_user'); return u ? JSON.parse(u) : null; } catch { return null; }
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [tutorials, setTutorials] = useState([]);
  const [aiStatus, setAiStatus] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [toast, setToast] = useState(null);
  const [favorites, setFavorites] = useState([]);

  // Toast notification
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    setToast({ message, type, duration, id: Date.now() });
  }, []);
  const dismissToast = useCallback(() => setToast(null), []);

  // Auth check helper — returns true if logged in, shows toast if not
  const requireAuth = useCallback((action = 'use this feature') => {
    if (token) return true;
    showToast(`Sign in to ${action}`, 'warning');
    return false;
  }, [token, showToast]);

  // Axios instance with auth header
  const api = useCallback(() => {
    const instance = axios.create({ baseURL: API });
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return instance;
  }, [token]);

  // Save/clear auth to localStorage
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('lumina_token', token);
      localStorage.setItem('lumina_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lumina_token');
      localStorage.removeItem('lumina_user');
    }
  }, [token, user]);

  // Fetch initial data
  useEffect(() => {
    const ax = api();
    const fetches = [
      ax.get('/tutorials').then(r => setTutorials(r.data)),
      ax.get('/ai/status').then(r => setAiStatus(r.data)),
      ax.get('/tutorials/meta/stats').then(r => setStats(r.data)),
    ];
    // Only fetch chat history if logged in (requires auth)
    if (token) {
      fetches.push(ax.get('/ai/history').then(r => setChatMessages(r.data.map(m => ({ role: m.role, content: m.content })))));
    }
    Promise.all(fetches).catch(err => console.error('Failed to connect to backend:', err))
      .finally(() => setLoading(false));
  }, [api]);

  // Fetch user progress and favorites if logged in
  useEffect(() => {
    if (token) {
      api().get('/progress').then(r => setUserProgress(r.data)).catch(() => {});
      api().get('/auth/me').then(r => setUser(prev => ({ ...prev, ...r.data }))).catch(() => {});
      api().get('/tutorials/favorites').then(r => setFavorites(r.data)).catch(() => {});
      // Ping activity to keep streak alive
      api().post('/auth/activity').then(r => {
        setUser(prev => prev ? { ...prev, streak_days: r.data.streak_days, last_active: r.data.last_active } : prev);
      }).catch(() => {});
    }
  }, [token, api]);

  // === AUTH ===
  const signup = async (username, email, password, display_name) => {
    const { data } = await axios.post(`${API}/auth/signup`, { username, email, password, display_name });
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const login = async (login, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { login, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setUserProgress([]);
    setChatMessages([]);
    setFavorites([]);
  };

  const setSkillLevel = async (skill_level) => {
    const { data } = await api().put('/auth/me/skill-level', { skill_level });
    setUser(prev => ({ ...prev, skill_level: data.skill_level }));
    return data;
  };

  // === TUTORIALS / AI ===
  const sendChat = async (message, context) => {
    const userMsg = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMsg]);

    try {
      const { data } = await api().post('/ai/chat', { message, context });
      const aiMsg = { role: 'assistant', content: data.reply };
      setChatMessages(prev => [...prev, aiMsg]);
      return data;
    } catch {
      const errorMsg = { role: 'assistant', content: "I'm having trouble connecting. Please check if the backend is running!" };
      setChatMessages(prev => [...prev, errorMsg]);
    }
  };

  const generateTutorial = async (topic, difficulty) => {
    const { data } = await api().post('/ai/generate-tutorial', { topic, difficulty });
    setTutorials(prev => [data, ...prev]);
    if (stats) setStats(s => ({ ...s, totalTutorials: s.totalTutorials + 1 }));
    return data;
  };

  const explainConcept = async (text, tutorialTitle) => {
    const { data } = await api().post('/ai/explain', { text, tutorialTitle });
    return data;
  };

  const likeTutorial = async (id) => {
    if (!requireAuth('like tutorials')) return;
    try {
      const { data } = await api().post(`/tutorials/${id}/like`);
      setTutorials(prev => prev.map(t => t._id === id ? { ...t, likes: data.likes } : t));
    } catch {
      showToast('Failed to like tutorial', 'error');
    }
  };

  const toggleFavorite = async (id) => {
    if (!requireAuth('save favorites')) return;
    try {
      const { data } = await api().post(`/tutorials/${id}/favorite`);
      if (data.favorited) {
        setFavorites(prev => [...prev, data.tutorial]);
      } else {
        setFavorites(prev => prev.filter(f => f._id !== id));
      }
      return data;
    } catch {
      showToast('Failed to update favorite', 'error');
    }
  };

  const isFavorited = useCallback((id) => {
    return favorites.some(f => f._id === id);
  }, [favorites]);

  const fetchTutorials = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);
    const { data } = await api().get(`/tutorials?${params}`);
    setTutorials(data);
    return data;
  };

  const deleteTutorial = async (id) => {
    if (!requireAuth('delete tutorials')) return;
    try {
      await api().delete(`/tutorials/${id}`);
      setTutorials(prev => prev.filter(t => t._id !== id));
      setFavorites(prev => prev.filter(f => f._id !== id));
      if (stats) setStats(s => ({ ...s, totalTutorials: Math.max(0, s.totalTutorials - 1) }));
      showToast('Tutorial deleted', 'info');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete tutorial';
      showToast(msg, 'error');
    }
  };

  const clearChat = async () => {
    await api().delete('/ai/history');
    setChatMessages([]);
  };

  // === PROGRESS ===
  const updateProgress = async (tutorialId, data) => {
    const resp = await api().post(`/progress/${tutorialId}`, data);
    // Refresh progress list
    api().get('/progress').then(r => setUserProgress(r.data)).catch(() => {});
    // Refresh user data
    if (data.completed) {
      api().get('/auth/me').then(r => {
        setUser(prev => ({ ...prev, ...r.data }));
      }).catch(() => {});
    }
    return resp.data;
  };

  const getRecommended = async () => {
    const { data } = await api().get('/progress/recommended');
    return data;
  };

  const cancelProgress = async (tutorialId, progressId) => {
    if (tutorialId) {
      await api().delete(`/progress/${tutorialId}`);
      setUserProgress(prev => prev.filter(p => p.tutorial_id !== tutorialId));
    } else if (progressId) {
      // Orphaned progress — clean up via refetch
      await api().delete('/progress/cleanup/orphans');
      setUserProgress(prev => prev.filter(p => p._id !== progressId));
    }
  };

  return (
    <AppContext.Provider value={{
      // Auth
      user, token, signup, login, logout, setSkillLevel,
      isLoggedIn: !!token, requireAuth,
      // Toast
      toast, showToast, dismissToast,
      // Tutorials
      tutorials, loading, stats, aiStatus,
      chatOpen, setChatOpen, chatMessages, setChatMessages, sendChat, clearChat,
      generateTutorial, explainConcept, likeTutorial, fetchTutorials, deleteTutorial,
      // Favorites
      favorites, toggleFavorite, isFavorited,
      // Progress
      userProgress, updateProgress, getRecommended, cancelProgress,
      // Utilities
      api, API
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
