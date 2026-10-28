import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

const tone = {
  info: 'border-l-moss',
  success: 'border-l-mint',
  error: 'border-l-danger'
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const toast = useCallback((message, type = 'info') => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, type, leaving: false }]);
    setTimeout(() => setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t))), 3400);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4100);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] grid gap-2.5" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.type === 'error' ? 'alert' : 'status'}
            className={`min-w-[240px] max-w-[360px] rounded-2xl border border-l-[3px] border-moss/25 bg-white px-[18px] py-3.5 shadow-[0_12px_30px_rgba(96,105,92,0.25)] ${tone[t.type]} ${
              t.leaving ? 'animate-toast-out' : 'animate-toast-in'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
