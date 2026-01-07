import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  Trash2, Search, Download, CheckCircle2, BrainCircuit, 
  ChevronLeft, ChevronRight, Lock, LogIn, UserPlus, 
  LogOut, Mail, User, Eye, EyeOff, BookOpen, Save 
} from 'lucide-react';
import './App.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const supabaseUrl = 'https://vwcmdfeliiryobcjdqgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Y21kZmVsaWlyeW9iY2pkcWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3OTM4NDYsImV4cCI6MjA4MzM2OTg0Nn0.sqkIAnkDthI9OVPjRNpJa_Pld2LuwgfZRgQjInPYggk';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MOOD_COLORS = {
  happy: '#b9fbc0',
  neutral: '#f5f5dc',
  sad: '#a2d2ff',
  anxious: '#e0dbff',
  angry: '#ff7f7f'
};

const MOOD_LABELS = {
  happy: 'Feliz/Radiante',
  neutral: 'Neutro/Calmo',
  sad: 'Triste/Deprê',
  anxious: 'Ansioso/Nervoso',
  angry: 'Bravo/Muito Estressado/Raiva'
};

export default function App() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [view, setView] = useState('journal'); 
  const [search, setSearch] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({ situation: '', thoughts: '', mood: 'neutral' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchEntries();
    });
  }, []);

  async function fetchEntries() {
    const { data, error } = await supabase.from('entries').select('*').order('date', { ascending: false });
    if (!error) setEntries(data);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.situation) return;
    const { error } = await supabase.from('entries').insert([{ ...formData, date: new Date().toISOString(), user_id: user.id }]);
    if (!error) {
      setFormData({ situation: '', thoughts: '', mood: 'neutral' });
      fetchEntries();
    }
  };

  // Lógica do Calendário
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days };
  };

  const { firstDay, days } = getDaysInMonth(currentMonth);
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= days; i++) calendarDays.push(i);

  const getDayMoodColor = (day) => {
    if (!day) return null;
    const entry = entries.find(e => {
      const d = new Date(e.date);
      return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
    });
    return entry ? MOOD_COLORS[entry.mood] : null;
  };

  const filteredEntries = entries.filter(e => 
    e.situation.toLowerCase().includes(search.toLowerCase()) || 
    e.thoughts.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) return <div className="container">Carregando...</div>;

  return (
    <div className="container">
      <nav className="bottom-nav">
        <button className={view === 'journal' ? 'nav-item active' : 'nav-item'} onClick={() => setView('journal')}>
          <BookOpen size={24} /><span>Registros</span>
        </button>
        <button className={view === 'profile' ? 'nav-item active' : 'nav-item'} onClick={() => setView('profile')}>
          <User size={24} /><span>Perfil</span>
        </button>
      </nav>

      <header className="header">
        <div className="logo-icon"><BrainCircuit size={42} /></div>
        <h1>MINDLOG</h1>
      </header>

      {view === 'journal' && (
        <>
          <form className="card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Como você está?</label>
              <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})}>
                {Object.keys(MOOD_LABELS).map(key => <option key={key} value={key}>{MOOD_LABELS[key]}</option>)}
              </select>
            </div>
            <textarea placeholder="O que aconteceu?" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} />
            <button type="submit" className="btn-primary" style={{marginTop: '10px'}}><CheckCircle2 size={20} /> SALVAR REGISTRO</button>
          </form>

          {/* VISÃO MENSAL DE CALENDÁRIO */}
          <section className="card">
            <div className="calendar-header">
              <button className="nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                <ChevronLeft size={20} />
              </button>
              <h2>{new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentMonth).toUpperCase()}</h2>
              <button className="nav-btn" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="calendar-grid">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}
              {calendarDays.map((day, i) => {
                const color = getDayMoodColor(day);
                return (
                  <div key={i} className="day-dot" style={color ? { backgroundColor: color, color: '#000', fontWeight: 'bold' } : {}}>
                    {day}
                  </div>
                );
              })}
            </div>
          </section>

          {/* BUSCA E FILTROS */}
          <div className="search-section">
            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <Search size={18} />
                <input placeholder="BUSCAR REGISTROS..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="download-btn-modern"><Download size={20} /></button>
            </div>
          </div>

          <div className="entries-list">
            {filteredEntries.map(e => (
              <div key={e.id} className="entry-card" style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}>
                <div className="entry-header">
                  <span style={{color: MOOD_COLORS[e.mood]}}>{MOOD_LABELS[e.mood].toUpperCase()}</span>
                  <span>{new Date(e.date).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="entry-text">{e.situation}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
