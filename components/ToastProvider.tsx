import React, { useEffect } from 'react';
import { useToastStore } from '../stores/toastStore';
import { Toast, ToastProvider as ShadcnToastProvider, ToastViewport } from './ui/toast';
import { ToastTitle, ToastDescription } from './ui/toast';

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useToastStore();

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [toasts, removeToast]);

  return (
    <ShadcnToastProvider>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant as any} className="bg-card text-card-foreground">
          <ToastTitle className="text-foreground">{toast.title}</ToastTitle>
          {toast.description && <ToastDescription className="text-muted-foreground">{toast.description}</ToastDescription>}
        </Toast>
      ))}
      <ToastViewport />
    </ShadcnToastProvider>
  );
};

export default ToastProvider;
