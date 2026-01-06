import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Trash2, Search, Download, CheckCircle2, BrainCircuit } from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// PALETA PERSONALIZADA
const MOOD_COLORS = {
  happy: '#b9fbc0',   // Verde Menta
  neutral: '#f5f5dc', // Bege Neutro
  sad: '#a2d2ff',     // Azul Pastel
  anxious: '#e0dbff', // Lavanda Clarinho
  angry: '#ff7f7f'    // Coral Melancia
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('mindlog_v6')) || []);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ 
    situation: '', 
    emotion: '', 
    thoughts: '', 
    behavior: '', 
    mood: 'neutral' 
  });

  useEffect(() => {
    localStorage.setItem('mindlog_v6', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', emotion: '', thoughts: '', behavior: '', mood: 'neutral' });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("MINDLOG - REGISTROS", 14, 20);
    const tableRows = entries.map(e => [
      new Date(e.date).toLocaleDateString('pt-BR'),
      e.mood.toUpperCase(),
      e.situation,
      e.emotion,
      e.thoughts,
      e.behavior
    ]);
    doc.autoTable({ 
      head: [['DATA', 'HUMOR', 'SITUAÇÃO', 'EMOÇÃO', 'PENSAMENTO', 'COMPORTAMENTO']], 
      body: tableRows, 
      startY: 30,
      styles: { fontSize: 7 }
    });
    doc.save("meu-diario.pdf");
  };

  const filteredEntries = entries.filter(e => 
    e.situation.toLowerCase().includes(search.toLowerCase()) || 
    e.thoughts.toLowerCase().includes(search.toLowerCase()) ||
    e.emotion.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <header className="header">
        <div className="logo-icon" style={{ borderColor: MOOD_COLORS[formData.mood], color: MOOD_COLORS[formData.mood] }}>
          <BrainCircuit size={42} strokeWidth={1.5} />
        </div>
        <h1>MINDLOG</h1>
      </header>

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

      <form className="card" onSubmit={handleSubmit}>
        {/* 1. TOM */}
        <div className="form-group">
          <label>Qual o seu tom agora?</label>
          <select 
            value={formData.mood} 
            onChange={e => setFormData({...formData, mood: e.target.value})}
            style={{ borderLeft: `6px solid ${MOOD_COLORS[formData.mood]}` }}
          >
            <option value="happy">Verde Menta (Feliz)</option>
            <option value="neutral">Bege Neutro (Calmo)</option>
            <option value="sad">Azul Pastel (Triste)</option>
            <option value="anxious">Lavanda Clarinho (Ansioso)</option>
            <option value="angry">Coral Melancia (Bravo)</option>
          </select>
        </div>
        
        {/* 2. SITUAÇÃO */}
        <div className="form-group">
          <label>Situação</label>
          <textarea placeholder="O que aconteceu?" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} />
        </div>

        {/* 3. EMOÇÃO */}
        <div className="form-group">
          <label>Emoção</label>
          <textarea placeholder="O que você sentiu no corpo e na mente?" value={formData.emotion} onChange={e => setFormData({...formData, emotion: e.target.value})} />
        </div>
        
        {/* 4. PENSAMENTO */}
        <div className="form-group">
          <label>Pensamento</label>
          <textarea placeholder="O que você pensou sobre isso?" value={formData.thoughts} onChange={e => setFormData({...formData, thoughts: e.target.value})} />
        </div>

        {/* 5. COMPORTAMENTO */}
        <div className="form-group">
          <label>Comportamento</label>
          <textarea placeholder="O que você fez em seguida?" value={formData.behavior} onChange={e => setFormData({...formData, behavior: e.target.value})} />
        </div>
        
        <button type="submit" className="btn-primary">
          <CheckCircle2 size={22} /> SALVAR NO DIÁRIO
        </button>
      </form>

      <div className="actions-row">
        <div className="search-bar">
          <Search size={18} color="#a1a1aa" />
          <input placeholder="BUSCAR..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={exportPDF} className="icon-btn"><Download size={22} /></button>
      </div>

      <div className="entries-list">
        {filteredEntries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}>
            <div className="entry-header">
              <span style={{color: MOOD_COLORS[e.mood], fontWeight: 'bold'}}>{e.mood.toUpperCase()}</span>
              <span>{new Date(e.date).toLocaleDateString()}</span>
              <Trash2 size={18} onClick={() => setEntries(entries.filter(i => i.id !== e.id))} style={{cursor: 'pointer'}} />
            </div>
            <div className="entry-section-title">Situação</div>
            <div className="entry-text">{e.situation}</div>
            <div className="entry-section-title">Emoção</div>
            <div className="entry-text">{e.emotion}</div>
            <div className="entry-section-title">Pensamento</div>
            <div className="entry-text">{e.thoughts}</div>
            <div className="entry-section-title">Comportamento</div>
            <div className="entry-text">{e.behavior}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
