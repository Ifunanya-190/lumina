import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

const typeConfig = {
  info: { icon: FaInfoCircle, accent: 'var(--color-aurora-cyan)', label: 'Info' },
  success: { icon: FaCheckCircle, accent: 'var(--color-aurora-blue)', label: 'Done' },
  warning: { icon: FaExclamationTriangle, accent: '#F5A623', label: 'Warning' },
  error: { icon: FaExclamationCircle, accent: '#E74C5F', label: 'Error' },
};

const Toast = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    setProgress(100);
    const duration = toast.duration || 3000;
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [toast, onDismiss]);

  if (!toast) return null;

  const type = toast.type || 'info';
  const cfg = typeConfig[type] || typeConfig.info;
  const Icon = cfg.icon;

  return (
    <div className={`fixed bottom-6 right-6 z-[60] transition-all duration-300 ease-out ${visible ? 'opacity-100 translate-y-0 translate-x-0' : 'opacity-0 translate-y-2 translate-x-4 pointer-events-none'}`}>
      <div
        className="relative flex items-start gap-3 pl-4 pr-3 py-3.5 rounded-xl min-w-[280px] max-w-[380px] shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(12,15,26,0.95), rgba(20,24,40,0.98))',
          border: `1px solid color-mix(in srgb, ${cfg.accent} 25%, transparent)`,
        }}
      >
        {/* Accent stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: cfg.accent }} />

        <Icon className="text-base mt-0.5 shrink-0" style={{ color: cfg.accent }} />

        <div className="flex-1 min-w-0">
          <span className="text-[13px] text-white/90 leading-snug block">{toast.message}</span>
        </div>

        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
          className="text-white/20 hover:text-white/50 transition-colors mt-0.5 shrink-0"
        >
          <FaTimes className="text-[10px]" />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className="h-full rounded-full transition-none"
            style={{ width: `${progress}%`, background: cfg.accent, opacity: 0.6 }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
