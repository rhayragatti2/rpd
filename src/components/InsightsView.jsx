import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MoodBarChart from './MoodBarChart';
import MoodChart from './MoodChart';
import MoodTrendChart from './MoodTrendChart';
import MoodCalendar from './MoodCalendar';
import SearchBar from './SearchBar';
import EntryList from './EntryList';

const CHART_TABS = ['Semanal', 'Distribuição', 'Tendência'];

export default function InsightsView({ entries, entriesLoading, removeEntry, currentMonth, setCurrentMonth }) {
  const [chartTab, setChartTab] = useState(0);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('all');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthLabel = currentMonth
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const filteredEntries = useMemo(() => {
    const s = search.toLowerCase();
    return entries.filter((e) => {
      const matchesSearch =
        e.situation?.toLowerCase().includes(s) ||
        e.thoughts?.toLowerCase().includes(s) ||
        (e.emotion && e.emotion.toLowerCase().includes(s)) ||
        (e.behavior && e.behavior.toLowerCase().includes(s));
      const matchesMood = filterMood === 'all' || e.mood === filterMood;
      return matchesSearch && matchesMood;
    });
  }, [entries, search, filterMood]);

  return (
    <div className="view-fade">
      <div className="month-nav">
        <button className="icon-btn" onClick={prevMonth} aria-label="Mês anterior">
          <ChevronLeft size={20} />
        </button>
        <h2 className="month-nav__label">{monthLabel}</h2>
        <button className="icon-btn" onClick={nextMonth} aria-label="Próximo mês">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="chart-tabs">
        {CHART_TABS.map((label, i) => (
          <button
            key={label}
            className={`chart-tab ${chartTab === i ? 'chart-tab--active' : ''}`}
            onClick={() => setChartTab(i)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        {chartTab === 0 && <MoodBarChart entries={entries} currentMonth={currentMonth} />}
        {chartTab === 1 && <MoodChart entries={entries} currentMonth={currentMonth} />}
        {chartTab === 2 && <MoodTrendChart entries={entries} currentMonth={currentMonth} />}
      </div>

      <MoodCalendar entries={entries} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />

      <SearchBar search={search} setSearch={setSearch} filterMood={filterMood} setFilterMood={setFilterMood} />

      <EntryList entries={filteredEntries} loading={entriesLoading} onDelete={removeEntry} />
    </div>
  );
}
