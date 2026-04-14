import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MOOD_COLORS, MOOD_LABELS } from './constants/moods';
import { useAuth } from './hooks/useAuth';
import { useEntries } from './hooks/useEntries';
import { useProfile } from './hooks/useProfile';
import { ToastProvider } from './components/Toast';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import MoodChart from './components/MoodChart';
import JournalForm from './components/JournalForm';
import MoodCalendar from './components/MoodCalendar';
import SearchBar from './components/SearchBar';
import EntryList from './components/EntryList';
import ProfileView from './components/ProfileView';
import './App.css';

function AppContent() {
  const { user, loading: authLoading, login, register, logout, resetPassword } = useAuth();
  const { entries, loading: entriesLoading, addEntry, removeEntry } = useEntries(user);
  const { userName, setUserName, saveProfile } = useProfile(user);

  const [view, setView] = useState('journal');
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentMood, setCurrentMood] = useState('neutral');

  const viewRef = useRef(null);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.focus({ preventScroll: false });
    }
  }, [view]);

  const filteredEntries = useMemo(() => {
    const s = search.toLowerCase();
    return entries.filter((e) => {
      const matchesSearch =
        e.situation.toLowerCase().includes(s) ||
        e.thoughts.toLowerCase().includes(s) ||
        (e.emotion && e.emotion.toLowerCase().includes(s)) ||
        (e.behavior && e.behavior.toLowerCase().includes(s));
      const matchesMood = filterMood === 'all' || e.mood === filterMood;
      return matchesSearch && matchesMood;
    });
  }, [entries, search, filterMood]);

  const exportPDF = useCallback(() => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const nomeRelatorio = userName ? userName.toUpperCase() : 'USUÁRIO';

    doc.setFontSize(18);
    doc.text(`MINDLOG - HISTÓRICO DE ${nomeRelatorio}`, 14, 15);

    const tableRows = entries.map((e) => [
      new Date(e.date).toLocaleDateString('pt-BR'),
      MOOD_LABELS[e.mood].toUpperCase(),
      e.situation,
      e.emotion || '—',
      e.thoughts,
      e.behavior || '—',
    ]);

    doc.autoTable({
      head: [['DATA', 'TOM', 'SITUAÇÃO', 'EMOÇÃO', 'PENSAMENTO', 'COMPORTAMENTO']],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [45, 45, 48] },
      columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 35 } },
    });

    doc.save(`mindlog-${nomeRelatorio.toLowerCase()}.pdf`);
  }, [entries, userName]);

  if (authLoading) {
    return (
      <div className="container loading-screen">
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={login} onRegister={register} />;
  }

  const borderColor = view === 'journal' ? MOOD_COLORS[currentMood] : '#a1a1aa';

  return (
    <div className="container">
      <BottomNav view={view} setView={setView} />
      <Header borderColor={borderColor} userName={userName} />

      <main ref={viewRef} tabIndex={-1} className="main-content">
        {view === 'profile' ? (
          <ProfileView
            user={user}
            userName={userName}
            setUserName={setUserName}
            onSave={saveProfile}
            onLogout={logout}
            onResetPassword={resetPassword}
          />
        ) : (
          <>
            <MoodChart entries={entries} />
            <JournalForm
              onSubmit={addEntry}
              currentMood={currentMood}
              onMoodChange={setCurrentMood}
            />
            <MoodCalendar
              entries={entries}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
            />
            <SearchBar
              search={search}
              setSearch={setSearch}
              filterMood={filterMood}
              setFilterMood={setFilterMood}
              onExport={exportPDF}
            />
            <EntryList
              entries={filteredEntries}
              loading={entriesLoading}
              onDelete={removeEntry}
            />
          </>
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
