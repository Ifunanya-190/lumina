import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import AIMentor from './components/AIMentor';
import Toast from './components/Toast';
import HomePage from './pages/HomePage';
import TutorialsPage from './pages/TutorialsPage';
import TutorialDetailPage from './pages/TutorialDetailPage';
import AILabPage from './pages/AILabPage';
import AuthPage from './pages/AuthPage';
import AssessmentPage from './pages/AssessmentPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';

function AppContent() {
  const { toast, dismissToast } = useApp();
  return (
    <Router>
      <div className="min-h-screen relative">
        <div className="aurora-bg" />
        <Header />
        <AIMentor />
        <Toast toast={toast} onDismiss={dismissToast} />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tutorials" element={<TutorialsPage />} />
            <Route path="/tutorial/:id" element={<TutorialDetailPage />} />
            <Route path="/ai-lab" element={<AILabPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/assessment" element={<AssessmentPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;