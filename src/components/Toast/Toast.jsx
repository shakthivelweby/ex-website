import { useEffect } from 'react';

export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed inset-x-0 bottom-0 mb-4 flex items-center justify-center z-50 animate-slide-up">
      <div className="bg-black text-white px-6 py-3 rounded-lg shadow-lg text-sm font-medium">
        <div className="flex items-center gap-2">
          <i className="fi fi-rr-check text-green-400"></i>
          {message}
        </div>
      </div>
    </div>
  );
} 