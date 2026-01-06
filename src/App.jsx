import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Trash2, Search, Download, PlusCircle } from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// Cores de humor em tons de cinza/neutros para combinar
const MOOD_COLORS = {
  happy: '#cbd5e1', neutral: '#94a3b8', sad: '#475569', anxious: '#334155', angry: '#1e293b'
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('diary_v2')) || []);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ situation: '', emotions: '', thoughts: '', behavior: '', mood: 'neutral' });

  useEffect(() => {
    localStorage.setItem('diary_v2', JSON.stringify(entries));
    // Forçar tema dark
    document.documentElement.setAttribute('data-theme', 'dark');
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return alert("Descreva a situação");
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', emotions: '', thoughts: '', behavior: '', mood: 'neutral' });
  };

  const deleteEntry = (id) => {
    if (confirm("Deseja apagar este registro?")) setEntries(entries.filter(e => e.id !== id));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Registro de Pensamentos", 14, 20);
    const tableRows = entries.map(e => [
      new Date(e.date).toLocaleDateString('pt-BR'),
      e.mood.toUpperCase(), e.situation, e.thoughts
    ]);
    doc.autoTable({ 
      head: [['Data', 'Humor', 'Situação', 'Pensamentos']], 
      body: tableRows, 
      startY: 30,
      theme: 'grid'
    });
    doc.save("diario-mental.pdf");
  };

  const filteredEntries = entries.filter(e => 
    e.situation.toLowerCase().includes(search.toLowerCase()) || 
    e.thoughts.toLowerCase().includes(search.toLowerCase())
  );

  const chartData = {
    labels: ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Bravo'],
    datasets: [{
      data: ['happy', 'neutral', 'sad', 'anxious', 'angry'].map(m => entries.filter(e => e.mood === m).length),
      backgroundColor: Object.values(MOOD_COLORS),
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  return (
    <div className="container">
      <header className="header">
        <h1>DIÁRIO MENTAL</h1>
      </header>

      <section className="card">
        <div className="chart-wrapper">
          <Doughnut 
            data={chartData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } }
            }} 
          />
        </div>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Humor</label>
          <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})}>
            <option value="happy">Feliz</option>
            <option value="neutral">Neutro</option>
            <option value="sad">Triste</option>
            <option value="anxious">Ansioso</option>
            <option value="angry">Bravo</option>
          </select>
        </div>
        
        <label className="form-group">O que aconteceu?</label>
        <textarea rows="2" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} />
        
        <label className="form-group">Pensamentos</label>
        <textarea rows="2" value={formData.thoughts} onChange={e => setFormData({...formData, thoughts: e.target.value})} />
        
        <button type="submit" className="btn-primary">
          <PlusCircle size={20} /> SALVAR REGISTRO
        </button>
      </form>

      <div className="actions-row">
        <div className="search-bar">
          <Search size={18} color="#64748b" />
          <input placeholder="Buscar nos registros..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={exportPDF} className="icon-btn" style={{padding: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)'}}>
          <Download size={20} />
        </button>
      </div>

      <div className="entries-list">
        {filteredEntries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeftColor: MOOD_COLORS[e.mood] }}>
            <div className="entry-header">
              <span>{new Date(e.date).toLocaleDateString('pt-BR')} • {new Date(e.date).toLocaleTimeString('pt-BR', {hour: '2-刻', minute: '2-digit'})}</span>
              <button onClick={() => deleteEntry(e.id)} className="delete-btn"><Trash2 size={16} /></button>
            </div>
            <div className="entry-title">Situação</div>
            <div className="entry-text">{e.situation}</div>
            <div className="entry-title">Pensamentos</div>
            <div className="entry-text">{e.thoughts}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
