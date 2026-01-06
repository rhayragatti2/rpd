import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Trash2, Search, Download, CheckCircle2, BrainCircuit } from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// Sua Paleta Solicitada
const MOOD_COLORS = {
  happy: '#b9fbc0',   // Verde Menta
  neutral: '#f5f5dc', // Bege Neutro
  sad: '#a2d2ff',     // Azul Pastel
  anxious: '#e0dbff', // Lavanda Clarinho
  angry: '#ff7f7f'    // Coral Melancia
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('diary_final')) || []);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ situation: '', thoughts: '', mood: 'neutral' });

  useEffect(() => {
    localStorage.setItem('diary_final', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', thoughts: '', mood: 'neutral' });
  };

  const filteredEntries = entries.filter(e => 
    e.situation.toLowerCase().includes(search.toLowerCase()) || 
    e.thoughts.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <header className="header">
        <div className="logo-icon" style={{ borderColor: MOOD_COLORS[formData.mood], color: MOOD_COLORS[formData.mood] }}>
          <BrainCircuit size={42} strokeWidth={1.5} />
        </div>
        <h1 style={{letterSpacing: '0.2em', marginTop: '10px'}}>MINDLOG</h1>
      </header>

      <section className="card">
        <div className="chart-wrapper" style={{height: '220px'}}>
          <Doughnut 
            data={{
              labels: ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Bravo'],
              datasets: [{
                data: ['happy', 'neutral', 'sad', 'anxious', 'angry'].map(m => entries.filter(e => e.mood === m).length),
                backgroundColor: Object.values(MOOD_COLORS),
                borderWidth: 0,
                hoverOffset: 10
              }]
            }} 
            options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', usePointStyle: true, padding: 20 } } } 
            }} 
          />
        </div>
      </section>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Qual o seu tom agora?</label>
          <select 
            value={formData.mood} 
            onChange={e => setFormData({...formData, mood: e.target.value})}
            style={{ borderLeft: `6px solid ${MOOD_COLORS[formData.mood]}`, transition: '0.3s' }}
          >
            <option value="happy">Verde Menta (Feliz)</option>
            <option value="neutral">Bege Neutro (Calmo)</option>
            <option value="sad">Azul Pastel (Triste)</option>
            <option value="anxious">Lavanda Clarinho (Ansioso)</option>
            <option value="angry">Coral Melancia (Bravo)</option>
          </select>
        </div>
        
        <label className="form-group">O que houve?</label>
        <textarea placeholder="Situação..." value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} />
        
        <label className="form-group">Pensamentos</label>
        <textarea placeholder="O que pensou?" value={formData.thoughts} onChange={e => setFormData({...formData, thoughts: e.target.value})} />
        
        <button type="submit" className="btn-primary">
          <CheckCircle2 size={22} /> SALVAR NO DIÁRIO
        </button>
      </form>

      <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
        <div style={{flex: 1, background: 'var(--card)', borderRadius: '14px', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', padding: '0 15px'}}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            style={{border: 'none', background: 'transparent'}} 
            placeholder="Buscar..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <button onClick={() => {
            const doc = new jsPDF();
            doc.text("Historico Mindlog", 14, 20);
            doc.autoTable({ head: [['Data', 'Humor', 'Situacao']], body: entries.map(e => [new Date(e.date).toLocaleDateString(), e.mood, e.situation]) });
            doc.save("meu-diario.pdf");
        }} className="card" style={{margin: 0, padding: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
          <Download size={20} />
        </button>
      </div>

      <div className="entries-list">
        {filteredEntries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeftColor: MOOD_COLORS[e.mood] }}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)'}}>
              <span style={{color: MOOD_COLORS[e.mood], fontWeight: 'bold'}}>{e.mood.toUpperCase()}</span>
              <span>{new Date(e.date).toLocaleDateString()}</span>
              <Trash2 size={16} onClick={() => setEntries(entries.filter(i => i.id !== e.id))} style={{cursor: 'pointer'}} />
            </div>
            <div className="entry-section-title">Contexto</div>
            <div className="entry-text">{e.situation}</div>
            <div className="entry-section-title">Reflexão</div>
            <div className="entry-text">{e.thoughts}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
