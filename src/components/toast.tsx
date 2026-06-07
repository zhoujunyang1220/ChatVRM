import React, { useState, useEffect, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, message.duration || 4000);
    return () => clearTimeout(timer);
  }, [message.id, message.duration, onClose]);

  const getStyles = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default:
        return 'bg-surface3 border-surface3-hover text-text-secondary';
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      case 'info':
        return 'i';
      default:
        return 'i';
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
        shadow-lg animate-in slide-in-from-top-2 duration-300
        ${getStyles()}
      `}
      onClick={() => onClose(message.id)}
    >
      <div className="w-6 h-6 rounded-full bg-current/20 flex items-center justify-center text-sm font-bold">
        {getIcon()}
      </div>
      <span className="text-sm font-medium">{message.message}</span>
    </div>
  );
};

export interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onClose }) => {
  if (messages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  );
};

let toastCallback: ((message: Omit<ToastMessage, 'id'>) => void) | null = null;

export const setToastCallback = (callback: (message: Omit<ToastMessage, 'id'>) => void) => {
  toastCallback = callback;
};

export const showToast = (message: Omit<ToastMessage, 'id'>) => {
  if (toastCallback) {
    toastCallback(message);
  }
};

export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setToastCallback((message) => {
      const newMessage: ToastMessage = {
        ...message,
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      setToastCallback(() => null);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const addToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const newMessage: ToastMessage = {
      ...message,
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  return { messages, removeToast, addToast };
};