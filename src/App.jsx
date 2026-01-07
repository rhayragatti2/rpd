import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import * as Lucide from 'lucide-react'; // Importa todos os ícones
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const MOOD_COLORS = {
  happy: '#b9fbc0', neutral: '#f5f5dc', sad: '#a2d2ff', anxious: '#e0dbff', angry: '#ff7f7f'
};

// Categorias para organizar a "montanha" de ícones
const ICON_LIBRARY = {
  Saúde: ['Stethoscope', 'Heart', 'Activity', 'Baby', 'Syringe', 'Bandage', 'Pill', 'Thermometer', 'Brain'],
  Lazer: ['Coffee', 'Music', 'Camera', 'Palmtree', 'Tv', 'Gamepad2', 'Beer', 'Cigarette', 'Ghost'],
  Trabalho: ['Briefcase', 'Mail', 'Laptop', 'HardDrive', 'Database', 'FileText', 'Printer', 'Calculator', 'Languages'],
  Esporte: ['Dumbbell', 'Bike', 'Trophy', 'Target', 'Timer', 'Footprints', 'Sailboat', 'Mountain', 'Wind'],
  Social: ['Users', 'MessageCircle', 'Phone', 'Share2', 'UserPlus', 'VenetianMask', 'Smile', 'Annoyed', 'Frown'],
  Casa: ['Home', 'Utensils', 'ShoppingBag', 'Lightbulb', 'Trash2', 'Wrench', 'Hammer', 'Key', 'Bed'],
  Finanças: ['PiggyBank', 'Coins', 'CreditCard', 'TrendingUp', 'Wallet', 'Banknote', 'Zap', 'Diamond', 'Gift']
};

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('mindlog_v11')) || []);
  const [formData, setFormData] = useState({ 
    situation: '', emotion: '', thoughts: '', behavior: '', mood: 'neutral', iconName: 'Coffee' 
  });
  const [iconSearch, setIconSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('mindlog_v11', JSON.stringify(entries));
  }, [entries]);

  const renderIcon = (name, size = 20) => {
    const IconComponent = Lucide[name] || Lucide.HelpCircle;
    return <IconComponent size={size} />;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const newEntry = { ...formData, id: Date.now(), date: new Date().toISOString() };
    setEntries([newEntry, ...entries]);
    setFormData({ ...formData, situation: '', emotion: '', thoughts: '', behavior: '' });
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo-icon" style={{ borderColor: MOOD_COLORS[formData.mood], color: MOOD_COLORS[formData.mood] }}>
          {renderIcon('BrainCircuit', 42)}
        </div>
        <h1>MINDLOG</h1>
      </header>

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Como você está?</label>
          <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})}>
            <option value="happy">FELIZ</option>
            <option value="neutral">NEUTRO</option>
            <option value="sad">TRISTE</option>
            <option value="anxious">ANSIOSO</option>
            <option value="angry">BRAVO</option>
          </select>
        </div>

        {/* SELETOR DE ÍCONES 5x9 COM ROLAGEM */}
        <div className="form-group">
          <label>O que define este momento? (Arraste para o lado)</label>
          <div className="icon-selector-scroll">
            <div className="icon-grid-viewport">
              {Object.entries(ICON_LIBRARY).map(([category, icons]) => (
                <div key={category} className="icon-category-group">
                  <span className="category-label">{category}</span>
                  <div className="icons-horizontal-stack">
                    {icons.map(iconName => (
                      <button 
                        key={iconName}
                        type="button"
                        className={`icon-choice ${formData.iconName === iconName ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, iconName})}
                      >
                        {renderIcon(iconName)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-group"><label>Situação</label><textarea value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} /></div>
        <button type="submit" className="btn-primary">SALVAR REGISTRO</button>
      </form>

      <div className="entries-list">
        {entries.map(e => (
          <div key={e.id} className="entry-card" style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}>
            <div className="entry-header">
              <div className="entry-meta">
                <div className="entry-icon-circle">{renderIcon(e.iconName)}</div>
                <span style={{color: MOOD_COLORS[e.mood]}}>{e.mood.toUpperCase()}</span>
              </div>
              <span>{new Date(e.date).toLocaleDateString()}</span>
            </div>
            <div className="entry-text">{e.situation}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
