import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { Toast } from '../components/feedback/Toast.jsx';

const ToastContext = createContext(null);

let toastId = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast].slice(-5); // max 5 visible
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}

export function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', id });
  }, []);

  const show = useCallback(
    ({ type = 'info', message, duration = 4000 }) => {
      const id = ++toastId;
      dispatch({ type: 'ADD', toast: { id, type, message, duration } });

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast],
  );

  const success = useCallback((message, duration) => show({ type: 'success', message, duration }), [show]);
  const error = useCallback((message, duration) => show({ type: 'error', message, duration: duration ?? 6000 }), [show]);
  const warning = useCallback((message, duration) => show({ type: 'warning', message, duration }), [show]);
  const info = useCallback((message, duration) => show({ type: 'info', message, duration }), [show]);

  const value = useMemo(
    () => ({ show, success, error, warning, info }),
    [show, success, error, warning, info],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 2000,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem',
          pointerEvents: 'none',
          maxWidth: 'min(400px, calc(100vw - 2.5rem))',
        }}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
