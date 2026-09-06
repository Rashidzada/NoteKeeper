import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookOpen, Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authPage, setAuthPage] = useState('login'); // 'login' or 'register'

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4 animate-pulse">
          <BookOpen className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading NoteKeeper...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return authPage === 'login' ? (
      <LoginPage onNavigateRegister={() => setAuthPage('register')} />
    ) : (
      <RegisterPage onNavigateLogin={() => setAuthPage('login')} />
    );
  }

  return <DashboardPage />;
}
