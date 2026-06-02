import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * Toast Component for notifications.
 * @param {Object} props
 * @param {string} props.message - Message to display
 * @param {'success' | 'warning' | 'error' | 'info'} props.type - Type of notification
 * @param {function} props.onClose - Action when toast is dismissed
 * @param {number} [props.duration=4000] - Duration in milliseconds before auto-dismissal
 */
export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-[#171A21] border-[#22C55E]/20 text-[#F3F4F6]',
    warning: 'bg-[#171A21] border-[#F59E0B]/20 text-[#F3F4F6]',
    error: 'bg-[#171A21] border-[#EF4444]/20 text-[#F3F4F6]',
    info: 'bg-[#171A21] border-[#3B82F6]/20 text-[#F3F4F6]',
  };

  const Icons = {
    success: <CheckCircle className="w-5 h-5 text-[#22C55E]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />,
    error: <AlertCircle className="w-5 h-5 text-[#EF4444]" />,
    info: <CheckCircle className="w-5 h-5 text-[#3B82F6]" />, // fallback simple check
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm ${bgColors[type]}`}>
      <div className="flex-shrink-0">
        {Icons[type]}
      </div>
      <div className="text-sm font-medium tracking-wide">
        {message}
      </div>
      <button 
        onClick={onClose}
        className="ml-auto text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors p-1 rounded hover:bg-[#242936]"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
