import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Trash2, Search, Download, CheckCircle2, BrainCircuit, Activity } from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const MOOD_COLORS = {
  happy: '#10b981', neutral: '#71717a', sad: '#3f3f46', anxious: '#27272a', angry: '#18181b'
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('diary_v2')) || []);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ situation: '', emotions: '', thoughts: '', behavior: '', mood: 'neutral' });

  useEffect(() => {
    localStorage.setItem('diary_v2', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', emotions: '', thoughts: '', behavior: '', mood: 'neutral' });
  };

  const deleteEntry = (id) => {
    if (confirm("Remover registro?")) setEntries(entries.filter(e => e.id !== id));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatorio Diario Mental", 14, 20);
    const tableRows = entries.map(e => [
      new Date(e.date).toLocaleDateString('pt-BR'),
      e.mood.toUpperCase(), e.situation, e.thoughts
    ]);
    doc.autoTable({ head: [['Data', 'Humor', 'Situacao', 'Pensamentos']], body: tableRows, startY: 30 });
    doc.save("diario.pdf");
  };

  const filteredEntries = entries.filter(e => 
    e.situation.toLowerCase().includes(search.toLowerCase()) || 
    e.thoughts.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <header className="header">
        <div className="logo-icon">
          <BrainCircuit size={40} strokeWidth={1.5} />
        </div>
        <h1>MINDLOG.</h1>
        <p style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>REGISTRO DE PENSAMENTOS</p>
      </header>

      <section className="card">
        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
          <Activity size={18} color="var(--success)" />
          <h3 style={{margin: 0, fontSize: '0.9rem'}}>DISTRIBUIÇÃO DE HUMOR</h3>
        </div>
        <div className="chart-wrapper">
          <Doughnut 
            data={{
              labels: ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Bravo'],
              datasets: [{
                data: ['happy', 'neutral', 'sad', 'anxious', 'angry'].map(m => entries.filter(e => e.mood === m).length),
                backgroundColor: Object.values(MOOD_COLORS),
                borderWidth: 2,
                borderColor: 'var(--card)'
              }]
            }} 
            options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#a1a1aa', font: { size: 11 } } } } }} 
          />
        </div>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Como você se sente?</label>
          <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})}>
            <option value="happy">Radiante / Feliz</option>
            <option value="neutral">Neutro / Calmo</option>
            <option value="sad">Triste / Baixo</option>
            <option value="anxious">Ansioso / Inquieto</option>
            <option value="angry">Irritado / Bravo</option>
          </select>
        </div>
        
        <label className="form-group">Situação</label>
        <textarea placeholder="O que aconteceu?" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} />
        
        <label className="form-group">Pensamentos Automáticos</label>
        <textarea placeholder="O que passou pela sua cabeça?" value={formData.thoughts} onChange={e => setFormData({...formData, thoughts: e.target.value})} />
        
        <button type="submit" className="btn-primary">
          <CheckCircle2 size={22} /> SALVAR REGISTRO
        </button>
      </form>

      <div className="actions-row">
        <div className="search-bar">
          <Search size={20} color="var(--text-muted)" />
          <input placeholder="Filtrar histórico..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={exportPDF} className="icon-btn">
          <Download size={22} />
        </button>
      </div>

      <div className="entries-list">
        {filteredEntries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeftColor: MOOD_COLORS[e.mood] }}>
            <div className="entry-header">
              <span>{new Date(e.date).toLocaleDateString('pt-BR')} • {new Date(e.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
              <button onClick={() => deleteEntry(e.id)} className="delete-btn"><Trash2 size={18} /></button>
            </div>
            <div className="entry-section-title">Situação</div>
            <div className="entry-text">{e.situation}</div>
            <div className="entry-section-title">Pensamentos</div>
            <div className="entry-text">{e.thoughts}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
