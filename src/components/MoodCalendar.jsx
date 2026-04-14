import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOOD_COLORS, MOOD_LABELS } from '../constants/moods';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function MoodCalendar({ entries, currentMonth, setCurrentMonth }) {
  const entryDateMap = useMemo(() => {
    const map = new Map();
    entries.forEach((e) => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, e);
    });
    return map;
  }, [entries]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const getDayInfo = useCallback((day) => {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entry = entryDateMap.get(key);
    return {
      color: entry ? MOOD_COLORS[entry.mood] : 'rgba(255,255,255,0.05)',
      title: entry ? MOOD_LABELS[entry.mood] : 'Sem registro',
    };
  }, [entryDateMap, year, month]);

  const prevMonth = useCallback(() => {
    setCurrentMonth(new Date(year, month - 1, 1));
  }, [setCurrentMonth, year, month]);

  const nextMonth = useCallback(() => {
    setCurrentMonth(new Date(year, month + 1, 1));
  }, [setCurrentMonth, year, month]);

  const monthLabel = currentMonth
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .toUpperCase();

  return (
    <div className="card calendar-card" aria-label="Calendário de humor">
      <div className="calendar-header">
        <button className="icon-btn-small" onClick={prevMonth} aria-label="Mês anterior">
          <ChevronLeft size={20} />
        </button>
        <h3>{monthLabel}</h3>
        <button className="icon-btn-small" onClick={nextMonth} aria-label="Próximo mês">
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="calendar-grid" role="grid" aria-label="Dias do mês">
        {WEEKDAYS.map((d, i) => (
          <div key={i} className="calendar-day-label" role="columnheader">{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysCount }, (_, i) => i + 1).map((day) => {
          const { color, title } = getDayInfo(day);
          return (
            <div key={day} className="calendar-day">
              <div className="day-dot" style={{ backgroundColor: color }} title={title}>
                <span className="day-number">{day}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
