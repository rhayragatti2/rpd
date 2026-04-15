import React, { useState, useRef, useEffect } from 'react';
import { MOOD_COLORS } from './constants/moods';
import { useAuth } from './hooks/useAuth';
import { useEntries } from './hooks/useEntries';
import { useProfile } from './hooks/useProfile';
import { ToastProvider } from './components/Toast';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import HomeView from './components/HomeView';
import InsightsView from './components/InsightsView';
import ProfileView from './components/ProfileView';
import './App.css';

function AppContent() {
  const { user, loading: authLoading, login, register, logout, resetPassword } = useAuth();
  const { entries, loading: entriesLoading, addEntry, removeEntry } = useEntries(user);
  const { userName, setUserName, saveProfile } = useProfile(user);

  const [view, setView] = useState('home');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentMood, setCurrentMood] = useState('neutral');

  const viewRef = useRef(null);

  useEffect(() => {
    if (viewRef.current) viewRef.current.focus({ preventScroll: true });
  }, [view]);

  if (authLoading) {
    return (
      <div className="loading-screen">
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} onRegister={register} />;
  }

  const borderColor = view === 'home' ? MOOD_COLORS[currentMood] : '#7a7a85';

  return (
    <div className="container">
      <BottomNav view={view} setView={setView} />
      <Header
        borderColor={borderColor}
        userName={userName}
        compact={view === 'home'}
      />

      <main ref={viewRef} tabIndex={-1} className="main-content">
        {view === 'home' && (
          <HomeView
            entries={entries}
            entriesLoading={entriesLoading}
            addEntry={addEntry}
            removeEntry={removeEntry}
            currentMood={currentMood}
            setCurrentMood={setCurrentMood}
          />
        )}
        {view === 'insights' && (
          <InsightsView
            entries={entries}
            entriesLoading={entriesLoading}
            removeEntry={removeEntry}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />
        )}
        {view === 'profile' && (
          <ProfileView
            user={user}
            userName={userName}
            setUserName={setUserName}
            onSave={saveProfile}
            onLogout={logout}
            onResetPassword={resetPassword}
            entries={entries}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
