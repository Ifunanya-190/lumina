import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaSeedling, FaFire, FaBolt, FaArrowRight, FaBrain } from 'react-icons/fa';

const questions = [
  {
    q: 'How would you describe your experience with learning new skills online?',
    options: [
      { text: "I'm brand new — I haven't really tried learning skills online before", value: 0 },
      { text: "I've done a few tutorials here and there", value: 1 },
      { text: "I regularly learn new things and follow structured courses", value: 2 },
    ],
  },
  {
    q: 'When you start a new tutorial, what do you prefer?',
    options: [
      { text: "Baby steps — explain everything from scratch", value: 0 },
      { text: "Give me the basics, I'll figure out the rest", value: 1 },
      { text: "Skip the intro, show me the advanced techniques", value: 2 },
    ],
  },
  {
    q: 'How many different skills or hobbies have you actively practiced?',
    options: [
      { text: "1-2, I'm just getting started", value: 0 },
      { text: "3-5, I enjoy variety", value: 1 },
      { text: "6+, I love learning everything", value: 2 },
    ],
  },
];

const levels = [
  { key: 'beginner', icon: <FaSeedling />, name: 'Beginner', color: 'from-aurora-green to-emerald-400', desc: 'Start from scratch with step-by-step guidance. Perfect for discovering new interests.', shadow: 'shadow-aurora-green/20' },
  { key: 'intermediate', icon: <FaFire />, name: 'Intermediate', color: 'from-aurora-gold to-orange-400', desc: 'You know the basics. Dive deeper with more challenging tutorials and techniques.', shadow: 'shadow-aurora-gold/20' },
  { key: 'advanced', icon: <FaBolt />, name: 'Advanced', color: 'from-aurora-pink to-red-400', desc: 'Push your limits with expert-level content and complex projects.', shadow: 'shadow-aurora-pink/20' },
];

const AssessmentPage = () => {
  const { setSkillLevel, user, isLoggedIn } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0-2: questions, 3: result
  const [answers, setAnswers] = useState([]);
  const [saving, setSaving] = useState(false);

  if (!isLoggedIn) {
    navigate('/auth');
    return null;
  }

  const handleAnswer = (value) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setStep(questions.length); // show result
    }
  };

  const getRecommendedLevel = () => {
    const total = answers.reduce((a, b) => a + b, 0);
    if (total <= 2) return 'beginner';
    if (total <= 4) return 'intermediate';
    return 'advanced';
  };

  const handleConfirm = async (level) => {
    setSaving(true);
    try {
      await setSkillLevel(level);
      navigate('/');
    } catch {
      navigate('/');
    }
    setSaving(false);
  };

  const recommended = step >= questions.length ? getRecommendedLevel() : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-aurora-blue to-aurora-pink mb-4">
            <FaBrain className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            {step < questions.length ? 'Quick Assessment' : 'Your Learning Path'}
          </h1>
          <p className="text-white/40">
            {step < questions.length
              ? `Question ${step + 1} of ${questions.length} — Help us personalize your experience`
              : "Choose your path — you can always change this later"}
          </p>
        </div>

        {/* Progress bar */}
        {step < questions.length && (
          <div className="h-1.5 rounded-full bg-white/5 mb-8 max-w-md mx-auto">
            <div
              className="h-full rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-blue transition-all duration-500"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        )}

        {/* Question */}
        {step < questions.length && (
          <div className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white mb-6">{questions[step].q}</h2>
            <div className="space-y-3">
              {questions[step].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.value)}
                  className="w-full text-left px-5 py-4 rounded-xl glass hover:bg-white/10 hover:border-aurora-blue/30 transition-all duration-300 group"
                >
                  <span className="text-white/70 group-hover:text-white text-sm">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {step >= questions.length && (
          <div className="space-y-4">
            {/* Recommendation */}
            <div className="glass rounded-2xl p-5 mb-6 border border-aurora-cyan/20 bg-aurora-cyan/5">
              <p className="text-sm text-aurora-cyan">
                Based on your answers, we recommend: <strong className="text-white">{recommended.charAt(0).toUpperCase() + recommended.slice(1)}</strong>
              </p>
            </div>

            {/* Level cards */}
            <div className="grid gap-4">
              {levels.map((level) => {
                const isRecommended = level.key === recommended;
                return (
                  <button
                    key={level.key}
                    onClick={() => handleConfirm(level.key)}
                    disabled={saving}
                    className={`relative text-left p-5 rounded-2xl glass transition-all duration-300 hover:-translate-y-0.5 group ${
                      isRecommended ? 'border-aurora-cyan/30 bg-white/5' : 'hover:bg-white/5'
                    }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-aurora-cyan to-aurora-blue text-[10px] font-bold text-white uppercase tracking-wider">
                        Recommended
                      </span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${level.color} flex items-center justify-center text-white text-lg shrink-0 ${level.shadow} shadow-lg`}>
                        {level.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg">{level.name}</h3>
                        <p className="text-white/40 text-sm mt-0.5">{level.desc}</p>
                      </div>
                      <FaArrowRight className="text-white/20 group-hover:text-aurora-cyan transition-colors shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-center text-white/20 text-xs mt-4">
              You can change your level anytime from your profile
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentPage;
