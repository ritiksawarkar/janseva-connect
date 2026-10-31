import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OfficerAuthProvider } from './context/OfficerAuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <OfficerAuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </OfficerAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
