import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import JournalForm from './JournalForm';
import EntryList from './EntryList';

function computeStreak(entries) {
  if (!entries.length) return 0;
  const days = new Set();
  entries.forEach((e) => {
    const d = new Date(e.date);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });

  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function HomeView({ entries, entriesLoading, addEntry, removeEntry, currentMood, setCurrentMood }) {
  const streak = useMemo(() => computeStreak(entries), [entries]);

  const todayEntries = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return entries.filter((e) => new Date(e.date).toLocaleDateString() === today);
  }, [entries]);

  return (
    <div className="view-fade">
      {streak > 0 && (
        <div className="streak-badge">
          <Flame size={16} />
          <span>{streak} {streak === 1 ? 'dia' : 'dias'} consecutivos</span>
        </div>
      )}

      <JournalForm onSubmit={addEntry} currentMood={currentMood} onMoodChange={setCurrentMood} />

      {todayEntries.length > 0 && (
        <>
          <h3 className="section-title">Registros de hoje</h3>
          <EntryList entries={todayEntries} loading={entriesLoading} onDelete={removeEntry} />
        </>
      )}
    </div>
  );
}
