import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BrainCircuit, ChevronLeft, ChevronRight, CheckCircle2, Trash2 } from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const MOOD_COLORS = {
  happy: '#b9fbc0',
  neutral: '#f5f5dc',
  sad: '#a2d2ff',
  anxious: '#e0dbff',
  angry: '#ff7f7f'
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('mindlog_v16')) || []);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({ 
    situation: '', thoughts: '', mood: 'neutral'
  });

  useEffect(() => {
    localStorage.setItem('mindlog_v16', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', thoughts: '', mood: 'neutral' });
  };

  const deleteEntry = (id) => {
    if (window.confirm("Deseja excluir este registro?")) {
      setEntries(entries.filter(e => e.id !== id));
    }
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getDayColor = (day) => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString();
    const entry = entries.find(e => new Date(e.date).toLocaleDateString() === dayDate);
    return entry ? MOOD_COLORS[entry.mood] : 'rgba(255,255,255,0.05)';
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-icon" style={{ borderColor: MOOD_COLORS[formData.mood], color: MOOD_COLORS[formData.mood] }}>
          <BrainCircuit size={42} strokeWidth={1.5} />
        </div>
        <h1>MINDLOG</h1>
      </header>

      {/* Calendário */}
      <div className="card calendar-card">
        <div className="calendar-header">
          <button className="icon-btn-small" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
            <ChevronLeft size={20} />
          </button>
          <h3>{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
          <button className="icon-btn-small" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="calendar-grid">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}
          {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1).map(day => (
            <div key={day} className="calendar-day">
              <div className="day-dot" style={{ backgroundColor: getDayColor(day) }}>
                <span className="day-number">{day}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>QUAL O SEU TOM AGORA?</label>
          <select 
            value={formData.mood} 
            onChange={e => setFormData({...formData, mood: e.target.value})}
            style={{ borderLeft: `6px solid ${MOOD_COLORS[formData.mood]}` }}
          >
            <option value="happy">Feliz</option>
            <option value="neutral">Calmo/Normal</option>
            <option value="sad">Triste</option>
            <option value="anxious">Ansioso</option>
            <option value="angry">Bravo</option>
          </select>
        </div>

        <div className="form-group">
          <label>O QUE HOUVE?</label>
          <textarea 
            placeholder="Situação..." 
            value={formData.situation} 
            onChange={e => setFormData({...formData, situation: e.target.value})} 
          />
        </div>

        <div className="form-group">
          <label>PENSAMENTOS</label>
          <textarea 
            placeholder="O que pensou?" 
            value={formData.thoughts} 
            onChange={e => setFormData({...formData, thoughts: e.target.value})} 
          />
        </div>
        
        <button type="submit" className="btn-primary">
          <CheckCircle2 size={22} /> SALVAR NO DIÁRIO
        </button>
      </form>

      {/* Lista Simples de Histórico */}
      <div className="entries-list">
        {entries.slice().reverse().map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}>
            <div className="entry-header">
              <span className="entry-date">{new Date(e.date).toLocaleDateString()}</span>
              <Trash2 size={18} className="delete-icon" onClick={() => deleteEntry(e.id)} />
            </div>
            <div className="entry-content">
              <p><strong>Situação:</strong> {e.situation}</p>
              {e.thoughts && <p><strong>Pensamentos:</strong> {e.thoughts}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
