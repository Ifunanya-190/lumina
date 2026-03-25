import { useEffect, useRef, useState } from 'react';
import { FaTimes, FaTrashAlt, FaSignOutAlt, FaExclamationCircle } from 'react-icons/fa';

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel }) => {
  const dialogRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setClosing(false);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setClosing(true);
    setVisible(false);
    setTimeout(() => {
      setClosing(false);
      onCancel();
    }, 200);
  };

  const handleConfirm = () => {
    setClosing(true);
    setVisible(false);
    setTimeout(() => {
      setClosing(false);
      onConfirm();
    }, 200);
  };

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  if (!open && !closing) return null;

  const isDanger = variant === 'danger';
  const iconMap = {
    'Log Out': <FaSignOutAlt className="text-xl" />,
    'Delete': <FaTrashAlt className="text-xl" />,
  };
  const matchedIcon = Object.entries(iconMap).find(([key]) => title?.includes(key));
  const icon = matchedIcon ? matchedIcon[1] : <FaExclamationCircle className="text-xl" />;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} />

      {/* Dialog */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-[360px] outline-none transition-all duration-200 ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}
      >
        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(145deg, rgba(20,22,30,0.97), rgba(11,13,20,0.99))' }}>
          {/* Top accent bar */}
          <div className={`h-1 w-full ${isDanger ? 'bg-gradient-to-r from-red-500 via-orange-400 to-aurora-pink' : 'bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-green'}`} />

          <div className="px-7 pt-7 pb-6">
            {/* Icon + Close */}
            <div className="flex items-start justify-between mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : 'bg-aurora-cyan/10 text-aurora-cyan ring-1 ring-aurora-cyan/20'}`}>
                {icon}
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white/20 hover:text-white/60 hover:bg-white/5 transition-all -mt-1 -mr-1"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Content */}
            <h3 className="text-white font-bold text-xl mb-2 tracking-tight">{title}</h3>
            <p className="text-white/40 text-[13px] leading-relaxed mb-7">{message}</p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-150"
              >
                {cancelLabel}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${
                  isDanger
                    ? 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/20 hover:shadow-red-400/30'
                    : 'bg-gradient-to-r from-aurora-cyan via-aurora-blue to-aurora-pink text-nebula-900 shadow-lg shadow-aurora-cyan/20 hover:shadow-aurora-cyan/30'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
