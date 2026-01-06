import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Trash2, Search, Download, CheckCircle2, BrainCircuit } from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

// Sua Paleta Personalizada
const MOOD_COLORS = {
  happy: '#b9fbc0',   // Verde Menta
  neutral: '#f5f5dc', // Bege Neutro
  sad: '#a2d2ff',     // Azul Pastel
  anxious: '#e0dbff', // Lavanda Clarinho
  angry: '#ff7f7f'    // Coral Melancia
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('mindlog_v4')) || []);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ situation: '', thoughts: '', mood: 'neutral' });

  useEffect(() => {
    localStorage.setItem('mindlog_v4', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ situation: '', thoughts: '', mood: 'neutral' });
  };

  const deleteEntry = (id) => {
    if (confirm("Deseja apagar este registro?")) setEntries(entries.filter(e => e.id !== id));
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MINDLOG - Histórico de Pensamentos", 14, 20);
    const tableRows = entries.map(e => [
      new Date(e.date).toLocaleDateString('pt-BR'),
      e.mood.toUpperCase(), 
      e.situation, 
      e.thoughts
    ]);
    doc.autoTable({ 
      head: [['DATA', 'HUMOR', 'SITUAÇÃO', 'PENSAMENTOS']], 
      body: tableRows, 
      startY: 30,
      styles: { fontSize: 9 }
    });
    doc.save("meu-diario-mental.pdf");
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
        <h1>MINDLOG</h1>
      </header>

      {/* Gráfico de Distribuição */}
      <section className="card">
        <div className="chart-wrapper" style={{height: '220px'}}>
          <Doughnut 
            data={{
              labels: ['Feliz', 'Neutro', 'Triste', 'Ansioso', 'Bravo'],
              datasets: [{
                data: ['happy', 'neutral', 'sad', 'anxious', 'angry'].map(m => entries.filter(e => e.mood === m).length),
                backgroundColor: Object.values(MOOD_COLORS),
                borderWidth: 0,
                hoverOffset: 12
              }]
            }} 
            options={{ 
                maintainAspectRatio: false, 
                plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', usePointStyle: true, padding: 20, font: { size: 11 } } } } 
            }} 
          />
        </div>
      </section>

      {/* Formulário de Registro com Labels Padronizadas e Espaçamento Corrigido */}
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
        
        <div className="form-group">
          <label>O que houve?</label>
          <textarea 
            placeholder="Descreva a situação..." 
            value={formData.situation} 
            onChange={e => setFormData({...formData, situation: e.target.value})} 
          />
        </div>
        
        <div className="form-group">
          <label>Pensamentos</label>
          <textarea 
            placeholder="O que passou pela sua cabeça?" 
            value={formData.thoughts} 
            onChange={e => setFormData({...formData, thoughts: e.target.value})} 
          />
        </div>
        
        <button type="submit" className="btn-primary">
          <CheckCircle2 size={22} /> SALVAR NO DIÁRIO
        </button>
      </form>

      {/* Barra de Busca e Ações */}
      <div className="actions-row">
        <div className="search-bar">
          <Search size={18} color="var(--text-muted)" />
          <input 
            placeholder="FILTRAR REGISTROS..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <button onClick={exportPDF} className="icon-btn">
          <Download size={22} />
        </button>
      </div>

      {/* Lista de Entradas */}
      <div className="entries-list">
        {filteredEntries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeftColor: MOOD_COLORS[e.mood] }}>
            <div className="entry-header">
              <span style={{color: MOOD_COLORS[e.mood], fontWeight: '800', letterSpacing: '0.05em'}}>
                {e.mood.toUpperCase()}
              </span>
              <span>{new Date(e.date).toLocaleDateString('pt-BR')} • {new Date(e.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
              <button onClick={() => deleteEntry(e.id)} className="delete-btn">
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
