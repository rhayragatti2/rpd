import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Moon, Sun, Trash2, Search, Download, PlusCircle } from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const MOOD_COLORS = {
  happy: '#fde047', neutral: '#cbd5e1', sad: '#93c5fd', anxious: '#c4b5fd', angry: '#fca5a5'
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('diary_v2')) || []);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ situation: '', emotions: '', thoughts: '', behavior: '', mood: 'neutral' });

  useEffect(() => {
    localStorage.setItem('diary_v2', JSON.stringify(entries));
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [entries, theme]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return alert("Preencha a situação");
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', emotions: '', thoughts: '', behavior: '', mood: 'neutral' });
  };

  const deleteEntry = (id) => {
    if (confirm("Excluir?")) setEntries(entries.filter(e => e.id !== id));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatorio de Pensamentos", 14, 15);
    const tableRows = entries.map(e => [
      new Date(e.date).toLocaleDateString('pt-BR'),
      e.mood, e.situation, e.thoughts
    ]);
    doc.autoTable({ head: [['Data', 'Humor', 'Situacao', 'Pensamentos']], body: tableRows, startY: 20 });
    doc.save("diario-mental.pdf");
  };

  const filteredEntries = entries.filter(e => {
    const matchesSearch = e.situation.toLowerCase().includes(search.toLowerCase()) || 
                          e.thoughts.toLowerCase().includes(search.toLowerCase());
    if (filter === 'day') return new Date(e.date).toDateString() === new Date().toDateString() && matchesSearch;
    return matchesSearch;
  });

  const chartData = {
    labels: ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Bravo'],
    datasets: [{
      data: ['happy', 'neutral', 'sad', 'anxious', 'angry'].map(m => entries.filter(e => e.mood === m).length),
      backgroundColor: Object.values(MOOD_COLORS),
      borderWidth: 0
    }]
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Meu Diário 🧠</h1>
        <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? <Sun /> : <Moon />}
        </button>
      </header>

      <section className="card stats-card">
        <div className="chart-wrapper">
          <Doughnut data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      </section>

      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Humor Atual</label>
          <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})}>
            <option value="happy">😊 Feliz</option>
            <option value="neutral">😐 Neutro</option>
            <option value="sad">😢 Triste</option>
            <option value="anxious">😰 Ansioso</option>
            <option value="angry">😠 Bravo</option>
          </select>
        </div>
        <textarea placeholder="Situação..." value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} />
        <textarea placeholder="Pensamentos..." value={formData.thoughts} onChange={e => setFormData({...formData, thoughts: e.target.value})} />
        <button type="submit" className="btn-primary"><PlusCircle size={20} /> Salvar Registro</button>
      </form>

      <div className="actions-row">
        <div className="search-bar">
          <Search size={18} />
          <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={exportPDF} className="btn-secondary"><Download size={18} /></button>
      </div>

      <div className="entries-list">
        {filteredEntries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeftColor: MOOD_COLORS[e.mood] }}>
            <div className="entry-header">
              <small>{new Date(e.date).toLocaleString('pt-BR')}</small>
              <button onClick={() => deleteEntry(e.id)} className="delete-btn"><Trash2 size={16} /></button>
            </div>
            <p><strong>Situação:</strong> {e.situation}</p>
            <p><strong>Pensamentos:</strong> {e.thoughts}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
