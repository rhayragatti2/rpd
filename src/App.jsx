import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Trash2, Search, Download, CheckCircle2, BrainCircuit } from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// PALETA DEFINIDA POR VOCÊ
const MOOD_COLORS = {
  happy: '#b9fbc0',   // Verde Menta
  neutral: '#f5f5dc', // Bege Neutro
  sad: '#a2d2ff',     // Azul Pastel
  anxious: '#e0dbff', // Lavanda Clarinho
  angry: '#ff7f7f'    // Coral Melancia
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('mindlog_v5')) || []);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ situation: '', thoughts: '', mood: 'neutral' });

  useEffect(() => {
    localStorage.setItem('mindlog_v5', JSON.stringify(entries));
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

  const chartData = {
    labels: ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Bravo'],
    datasets: [{
      data: ['happy', 'neutral', 'sad', 'anxious', 'angry'].map(m => entries.filter(e => e.mood === m).length),
      backgroundColor: [
        MOOD_COLORS.happy,
        MOOD_COLORS.neutral,
        MOOD_COLORS.sad,
        MOOD_COLORS.anxious,
        MOOD_COLORS.angry
      ],
      borderWidth: 0,
      hoverOffset: 15
    }]
  };

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
            data={chartData} 
            options={{ 
              maintainAspectRatio: false, 
              plugins: { 
                legend: { 
                  position: 'bottom', 
                  labels: { color: '#a1a1aa', usePointStyle: true, padding: 20, font: { size: 12 } } 
                } 
              } 
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
            style={{ borderLeft: `6px solid ${MOOD_COLORS[formData.mood]}` }}
          >
            <option value="happy">Verde Menta (Feliz)</option>
            <option value="neutral">Bege Neutro (Calmo)</option>
            <option value="sad">Azul Pastel (Triste)</option>
            <option value="anxious">Lavanda Clarinho (Ansioso)</option>
            <option value="angry">Coral Melancia (Bravo)</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>O que houve?</label>
          <textarea 
            placeholder="Situação..." 
            value={formData.situation} 
            onChange={e => setFormData({...formData, situation: e.target.value})} 
          />
        </div>
        
        <div className="form-group">
          <label>Pensamentos</label>
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

      <div className="actions-row">
        <div className="search-bar">
          <Search size={18} color="#a1a1aa" />
          <input placeholder="BUSCAR..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="entries-list">
        {filteredEntries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}>
            <div className="entry-header">
              <span style={{color: MOOD_COLORS[e.mood], fontWeight: 'bold'}}>{e.mood.toUpperCase()}</span>
              <span>{new Date(e.date).toLocaleDateString()}</span>
              <button onClick={() => setEntries(entries.filter(i => i.id !== e.id))} className="delete-btn">
                <Trash2 size={18} />
              </button>
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
