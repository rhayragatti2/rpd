import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BrainCircuit, ChevronLeft, ChevronRight, CheckCircle2, Trash2, X } from 'lucide-react';
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
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('mindlog_v15')) || []);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState(null); // Para o Modal
  const [formData, setFormData] = useState({ 
    situation: '', thoughts: '', mood: 'neutral'
  });

  useEffect(() => {
    localStorage.setItem('mindlog_v15', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', thoughts: '', mood: 'neutral' });
  };

  const deleteEntry = (id, e) => {
    if (e) e.stopPropagation(); // Evita abrir modal se clicar no lixo dentro do card
    if (window.confirm("Deseja realmente excluir este registro?")) {
      setEntries(entries.filter(entry => entry.id !== id));
      if (selectedEntry?.id === id) setSelectedEntry(null);
    }
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getEntryForDay = (day) => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString();
    return entries.find(e => new Date(e.date).toLocaleDateString() === dayDate);
  };

  const handleDayClick = (day) => {
    const entry = getEntryForDay(day);
    if (entry) setSelectedEntry(entry);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-icon" style={{ borderColor: MOOD_COLORS[formData.mood], color: MOOD_COLORS[formData.mood] }}>
          <BrainCircuit size={42} strokeWidth={1.5} />
        </div>
        <h1>MINDLOG</h1>
      </header>

      {/* Calendário Interativo */}
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
          {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1).map(day => {
            const entry = getEntryForDay(day);
            return (
              <div 
                key={day} 
                className={`calendar-day ${entry ? 'has-entry' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="day-dot" style={{ backgroundColor: entry ? MOOD_COLORS[entry.mood] : 'rgba(255,255,255,0.05)' }}>
                  <span className="day-number">{day}</span>
                </div>
              </div>
            );
          })}
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

      {/* Lista de Registros */}
      <div className="entries-list">
        <h2 className="section-title">REGISTROS RECENTES</h2>
        {entries.length === 0 && <p className="empty-msg">Nenhum registro ainda.</p>}
        {entries.map(e => (
          <div 
            key={e.id} 
            className="entry-card" 
            style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}
            onClick={() => setSelectedEntry(e)}
          >
            <div className="entry-header">
              <span className="entry-mood-badge" style={{ color: MOOD_COLORS[e.mood] }}>
                {e.mood.toUpperCase()}
              </span>
              <div className="entry-actions">
                <span className="entry-date">{new Date(e.date).toLocaleDateString()}</span>
                <button className="delete-btn" onClick={(event) => deleteEntry(e.id, event)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <p className="entry-preview">{e.situation.substring(0, 80)}{e.situation.length > 80 ? '...' : ''}</p>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {selectedEntry && (
        <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ borderTop: `8px solid ${MOOD_COLORS[selectedEntry.mood]}` }}>
            <button className="close-modal" onClick={() => setSelectedEntry(null)}><X size={24} /></button>
            <div className="modal-header">
              <span className="modal-date">{new Date(selectedEntry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              <h2 style={{ color: MOOD_COLORS[selectedEntry.mood] }}>{selectedEntry.mood.toUpperCase()}</h2>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <label>SITUAÇÃO</label>
                <p>{selectedEntry.situation}</p>
              </div>
              {selectedEntry.thoughts && (
                <div className="modal-section">
                  <label>PENSAMENTOS</label>
                  <p>{selectedEntry.thoughts}</p>
                </div>
              )}
            </div>
            <button className="btn-delete-modal" onClick={() => deleteEntry(selectedEntry.id)}>
              EXCLUIR REGISTRO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
