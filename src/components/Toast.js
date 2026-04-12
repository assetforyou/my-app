import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../style/Toast.css';

// Toast Context
const ToastContext = createContext(null);

// Toast types with their configurations
const toastConfig = {
  success: { icon: CheckCircle, color: '#10b981', bgColor: '#d1fae5' },
  error: { icon: AlertCircle, color: '#ef4444', bgColor: '#fee2e2' },
  warning: { icon: AlertTriangle, color: '#f59e0b', bgColor: '#fef3c7' },
  info: { icon: Info, color: '#3b82f6', bgColor: '#dbeafe' },
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  // Convenience methods
  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem 
            key={toast.id} 
            toast={toast} 
            onRemove={() => removeToast(toast.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Individual Toast Component
const ToastItem = ({ toast, onRemove }) => {
  const config = toastConfig[toast.type] || toastConfig.info;
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onRemove]);

  return (
    <motion.div
      className={`toast toast-${toast.type}`}
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      style={{
        borderLeft: `4px solid ${config.color}`,
        backgroundColor: config.bgColor,
      }}
    >
      <div className="toast-icon">
        <Icon size={20} color={config.color} />
      </div>
      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
      </div>
      <button className="toast-close" onClick={onRemove} aria-label="Close notification">
        <X size={16} />
      </button>
      {toast.duration > 0 && (
        <div 
          className="toast-progress" 
          style={{ 
            animationDuration: `${toast.duration}ms`,
            backgroundColor: config.color 
          }} 
        />
      )}
    </motion.div>
  );
};

export default ToastProvider;