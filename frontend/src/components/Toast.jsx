import { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const icons = {
  info: <FaInfoCircle className="text-aurora-cyan" />,
  success: <FaCheckCircle className="text-aurora-green" />,
  warning: <FaExclamationTriangle className="text-aurora-gold" />,
  error: <FaExclamationTriangle className="text-aurora-pink" />,
};

const borderColors = {
  info: 'border-aurora-cyan/30',
  success: 'border-aurora-green/30',
  warning: 'border-aurora-gold/30',
  error: 'border-aurora-pink/30',
};

const Toast = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, toast.duration || 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  const type = toast.type || 'info';

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl glass border ${borderColors[type]} shadow-2xl min-w-[280px] max-w-[440px]`}>
        {icons[type]}
        <span className="text-sm text-white/80 flex-1">{toast.message}</span>
        <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} className="text-white/30 hover:text-white/60 transition-colors">
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
