'use client';

import React from 'react';
import ToastProvider from './ToastProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
};

export default ClientProviders;