import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Trash2, Search, Download, CheckCircle2, BrainCircuit, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('mindlog_v8')) || []);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({ 
    situation: '', emotion: '', thoughts: '', behavior: '', mood: 'neutral' 
  });

  useEffect(() => {
    localStorage.setItem('mindlog_v8', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', emotion: '', thoughts: '', behavior: '', mood: 'neutral' });
  };

  // Lógica do Calendário
  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getDayColor = (day) => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString();
    const entry = entries.find(e => new Date(e.date).toLocaleDateString() === dayDate);
    return entry ? MOOD_COLORS[entry.mood] : 'transparent';
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.situation.toLowerCase().includes(search.toLowerCase()) || 
                          e.thoughts.toLowerCase().includes(search.toLowerCase());
    const matchesMood = filterMood === 'all' || e.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  return (
    <div className="container">
      <header className="header">
        <div className="logo-icon" style={{ borderColor: MOOD_COLORS[formData.mood], color: MOOD_COLORS[formData.mood] }}>
          <BrainCircuit size={42} strokeWidth={1.5} />
        </div>
        <h1>MINDLOG</h1>
      </header>

      {/* Gráfico */}
      <section className="card">
        <div className="chart-wrapper">
          <Doughnut 
            data={{
              labels: ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Bravo'],
              datasets: [{
                data: ['happy', 'neutral', 'sad', 'anxious', 'angry'].map(m => entries.filter(e => e.mood === m).length),
                backgroundColor: Object.values(MOOD_COLORS),
                borderWidth: 0
              }]
            }} 
            options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa' } } } }} 
          />
        </div>
      </section>

      {/* Formulário */}
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Qual o seu tom agora?</label>
          <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})} style={{ borderLeft: `6px solid ${MOOD_COLORS[formData.mood]}` }}>
            <option value="happy">Verde Menta (Feliz)</option>
            <option value="neutral">Bege Neutro (Calmo)</option>
            <option value="sad">Azul Pastel (Triste)</option>
            <option value="anxious">Lavanda Clarinho (Ansioso)</option>
            <option value="angry">Coral Melancia (Bravo)</option>
          </select>
        </div>
        <div className="form-group"><label>Situação</label><textarea placeholder="O que houve?" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} /></div>
        <div className="form-group"><label>Emoção</label><textarea placeholder="O que sentiu?" value={formData.emotion} onChange={e => setFormData({...formData, emotion: e.target.value})} /></div>
        <div className="form-group"><label>Pensamento</label><textarea placeholder="O que pensou?" value={formData.thoughts} onChange={e => setFormData({...formData, thoughts: e.target.value})} /></div>
        <div className="form-group"><label>Comportamento</label><textarea placeholder="O que fez?" value={formData.behavior} onChange={e => setFormData({...formData, behavior: e.target.value})} /></div>
        <button type="submit" className="btn-primary"><CheckCircle2 size={22} /> SALVAR NO DIÁRIO</button>
      </form>

      {/* NOVO: VISÃO MENSAL DE CALENDÁRIO */}
      <div className="card calendar-card">
        <div className="calendar-header">
          <button className="icon-btn-small" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}><ChevronLeft size={18}/></button>
          <h3>{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
          <button className="icon-btn-small" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}><ChevronRight size={18}/></button>
        </div>
        <div className="calendar-grid">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}
          {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1).map(day => (
            <div key={day} className="calendar-day">
              <span className="day-number">{day}</span>
              <div className="day-dot" style={{ backgroundColor: getDayColor(day) }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Busca e Filtros */}
      <div className="search-section">
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <Search size={18} color="#a1a1aa" />
            <input placeholder="BUSCAR POR TEXTO..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={() => {/* função export pdf */}} className="download-btn-modern"><Download size={22} /></button>
        </div>
        <div className="filter-chips">
          <button className={filterMood === 'all' ? 'chip active' : 'chip'} onClick={() => setFilterMood('all')}>TODOS</button>
          {Object.keys(MOOD_COLORS).map(m => (
            <button key={m} className={filterMood === m ? 'chip active' : 'chip'} onClick={() => setFilterMood(m)} style={filterMood === m ? { backgroundColor: MOOD_COLORS[m], color: '#000' } : {}}>{m.toUpperCase()}</button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="entries-list">
        {filteredEntries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}>
            <div className="entry-header">
              <span style={{color: MOOD_COLORS[e.mood], fontWeight: 'bold'}}>{e.mood.toUpperCase()}</span>
              <span>{new Date(e.date).toLocaleDateString()}</span>
              <Trash2 size={18} onClick={() => setEntries(entries.filter(i => i.id !== e.id))} style={{cursor: 'pointer'}} />
            </div>
            <div className="entry-section-title">Situação</div><div className="entry-text">{e.situation}</div>
            <div className="entry-section-title">Pensamento</div><div className="entry-text">{e.thoughts}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
