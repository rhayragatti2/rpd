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

// CONFIGURAÇÃO SUPABASE
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
  happy: 'Feliz / Radiante',
  neutral: 'Neutro / Calmo',
  sad: 'Triste / Deprê',
  anxious: 'Ansioso / Nervoso',
  angry: 'Bravo / Muito Estressado / Raiva'
};

export default function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [view, setView] = useState('journal'); // 'journal' ou 'profile'

  // Perfil - Persistência Simples
  const [userName, setUserName] = useState(localStorage.getItem('ml_name') || '');

  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateType, setDateType] = useState('hoje'); 
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({ 
    situation: '', emotion: '', thoughts: '', behavior: '', mood: 'neutral' 
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchEntries();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchEntries();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('date', { ascending: false });

    if (!error) setEntries(data);
    setLoading(false);
  }

  const handleAuth = async (e) => {
    e.preventDefault();
    let result;
    if (isRegistering) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }
    if (result.error) alert(result.error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEntries([]);
    setView('journal');
  };

  const saveProfile = () => {
    localStorage.setItem('ml_name', userName);
    alert("Perfil atualizado!");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.situation) return;

    let finalDate = new Date();
    if (dateType === 'ontem') finalDate.setDate(finalDate.getDate() - 1);
    else if (dateType === 'outro') finalDate = new Date(customDate + "T12:00:00");

    const newEntry = { 
      ...formData, 
      date: finalDate.toISOString(),
      user_id: user.id 
    };

    const { error } = await supabase.from('entries').insert([newEntry]);
    
    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      setFormData({ situation: '', emotion: '', thoughts: '', behavior: '', mood: 'neutral' });
      setDateType('hoje');
      fetchEntries();
    }
  };

  const deleteEntry = async (id) => {
    if (window.confirm("Excluir registro permanentemente?")) {
      const { error } = await supabase.from('entries').delete().eq('id', id);
      if (!error) fetchEntries();
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); 
    const nomeRelatorio = userName ? userName.toUpperCase() : 'USUÁRIO';
    
    doc.setFontSize(18);
    doc.text(`MINDLOG - HISTÓRICO DE ${nomeRelatorio}`, 14, 15);
    
    const tableRows = entries.map(e => [
      new Date(e.date).toLocaleDateString('pt-BR'),
      MOOD_LABELS[e.mood].toUpperCase(),
      e.situation,
      e.emotion || '—',
      e.thoughts,
      e.behavior || '—'
    ]);

    doc.autoTable({
      head: [['DATA', 'TOM', 'SITUAÇÃO', 'EMOÇÃO', 'PENSAMENTO', 'COMPORTAMENTO']],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [45, 45, 48] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 35 }
      }
    });

    doc.save(`mindlog-${nomeRelatorio.toLowerCase()}.pdf`);
  };

  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const getDayColor = (day) => {
    const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString();
    const entry = entries.find(e => new Date(e.date).toLocaleDateString() === dayDate);
    return entry ? MOOD_COLORS[entry.mood] : 'rgba(255,255,255,0.05)';
  };

  const filteredEntries = entries.filter(e => {
    const searchLower = search.toLowerCase();
    const matchesSearch = e.situation.toLowerCase().includes(searchLower) || 
                          e.thoughts.toLowerCase().includes(searchLower) ||
                          (e.emotion && e.emotion.toLowerCase().includes(searchLower)) ||
                          (e.behavior && e.behavior.toLowerCase().includes(searchLower));
    const matchesMood = filterMood === 'all' || e.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  if (!user) {
    return (
      <div className="container login-screen">
        <header className="header">
          <div className="logo-icon" style={{ borderColor: '#fff' }}><BrainCircuit size={42} /></div>
          <h1>MINDLOG</h1>
        </header>
        <form className="card auth-card" onSubmit={handleAuth}>
          <h2>{isRegistering ? 'CRIAR CONTA' : 'ACESSAR DIÁRIO'}</h2>
          <div className="form-group">
            <div className="search-input-wrapper">
              <Mail size={18} color="#a1a1aa" />
              <input type="email" placeholder="E-MAIL" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <div className="search-input-wrapper">
              <Lock size={18} color="#a1a1aa" />
              <input type={showPassword ? "text" : "password"} placeholder="SENHA" value={password} onChange={e => setPassword(e.target.value)} required />
              {showPassword ? <EyeOff size={18} className="password-toggle" onClick={() => setShowPassword(false)} /> : <Eye size={18} className="password-toggle" onClick={() => setShowPassword(true)} />}
            </div>
          </div>
          <button type="submit" className="btn-primary">
            {isRegistering ? <UserPlus size={20}/> : <LogIn size={20}/>} 
            {isRegistering ? 'CADASTRAR' : 'ENTRAR'}
          </button>
          <p className="toggle-auth" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="bottom-nav">
        <button className={view === 'journal' ? 'nav-item active' : 'nav-item'} onClick={() => setView('journal')}>
          <BookOpen size={24} />
          <span>Diário</span>
        </button>
        <button className={view === 'profile' ? 'nav-item active' : 'nav-item'} onClick={() => setView('profile')}>
          <User size={24} />
          <span>Perfil</span>
        </button>
      </nav>

      <header className="header">
        <div className="logo-icon" style={{ borderColor: view === 'journal' ? MOOD_COLORS[formData.mood] : '#a1a1aa' }}>
          <BrainCircuit size={42} strokeWidth={1.5} />
        </div>
        <h1>MINDLOG</h1>
        {userName && <p className="welcome-text">Olá, {userName}</p>}
      </header>

      {view === 'profile' ? (
        <section className="profile-section">
          <div className="card">
            <h2>MEU PERFIL</h2>
            <div className="form-group">
              <label>Nome</label>
              <input type="text" placeholder="Como quer ser chamado?" value={userName} onChange={e => setUserName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>E-mail</label>
              <div className="search-input-wrapper readonly">
                <Mail size={18} color="#555" />
                <input type="text" value={user.email} readOnly />
              </div>
            </div>
            <div className="form-group">
              <label>Senha Cadastrada</label>
              <div className="search-input-wrapper readonly">
                <Lock size={18} color="#555" />
                <input type={showPassword ? "text" : "password"} value={password} readOnly />
                {showPassword ? <EyeOff size={18} className="password-toggle" onClick={() => setShowPassword(false)} /> : <Eye size={18} className="password-toggle" onClick={() => setShowPassword(true)} />}
              </div>
            </div>
            <button className="btn-primary" onClick={saveProfile} style={{marginBottom: '10px'}}><Save size={20} /> SALVAR ALTERAÇÕES</button>
            <button className="btn-secondary logout-full" onClick={handleLogout}><LogOut size={20} /> SAIR DA CONTA</button>
          </div>
        </section>
      ) : (
        <>
          <section className="card">
            <div className="chart-wrapper">
              <Doughnut 
                data={{
                  labels: Object.values(MOOD_LABELS),
                  datasets: [{
                    data: ['happy', 'neutral', 'sad', 'anxious', 'angry'].map(m => entries.filter(e => e.mood === m).length),
                    backgroundColor: Object.values(MOOD_COLORS),
                    borderWidth: 0
                  }]
                }} 
                options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', usePointStyle: true } } } }} 
              />
            </div>
          </section>

          <form className="card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Qual o seu tom agora?</label>
              <select value={formData.mood} onChange={e => setFormData({...formData, mood: e.target.value})} style={{ borderLeft: `6px solid ${MOOD_COLORS[formData.mood]}` }}>
                {Object.keys(MOOD_LABELS).map(key => <option key={key} value={key}>{MOOD_LABELS[key]}</option>)}
              </select>
            </div>
            <div className="form-group"><label>Situação</label><textarea placeholder="O que aconteceu?" value={formData.situation} onChange={e => setFormData({...formData, situation: e.target.value})} /></div>
            <div className="form-group"><label>Emoção</label><textarea placeholder="O que sentiu?" value={formData.emotion} onChange={e => setFormData({...formData, emotion: e.target.value})} /></div>
            <div className="form-group"><label>Pensamento</label><textarea placeholder="O que pensou?" value={formData.thoughts} onChange={e => setFormData({...formData, thoughts: e.target.value})} /></div>
            <div className="form-group"><label>Comportamento</label><textarea placeholder="O que fez?" value={formData.behavior} onChange={e => setFormData({...formData, behavior: e.target.value})} /></div>
            
            <div className="form-group date-selection">
              <label>Quando aconteceu?</label>
              <div className="date-chips">
                {['hoje', 'ontem', 'outro'].map(t => (
                  <button key={t} type="button" className={dateType === t ? 'chip active' : 'chip'} onClick={() => setDateType(t)}>
                    {t.toUpperCase() === 'OUTRO' ? 'OUTRA DATA' : t.toUpperCase()}
                  </button>
                ))}
              </div>
              {dateType === 'outro' && <input type="date" className="custom-date-input" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />}
            </div>
            <button type="submit" className="btn-primary"><CheckCircle2 size={22} /> SALVAR NO DIÁRIO</button>
          </form>

          <div className="card calendar-card">
            <div className="calendar-header">
              <button className="icon-btn-small" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}><ChevronLeft size={20}/></button>
              <h3>{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
              <button className="icon-btn-small" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}><ChevronRight size={20}/></button>
            </div>
            <div className="calendar-grid">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => <div key={d} className="calendar-day-label">{d}</div>)}
              {Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => i + 1).map(day => (
                <div key={day} className="calendar-day"><div className="day-dot" style={{ backgroundColor: getDayColor(day) }}><span className="day-number">{day}</span></div></div>
              ))}
            </div>
          </div>

          <div className="search-section">
            <div className="search-bar-container">
              <div className="search-input-wrapper">
                <Search size={18} color="#a1a1aa" />
                <input placeholder="BUSCAR..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button onClick={exportPDF} className="download-btn-modern"><Download size={24} /></button>
            </div>
            <div className="filter-chips">
              <button className={filterMood === 'all' ? 'chip active' : 'chip'} onClick={() => setFilterMood('all')}>TODOS</button>
              {Object.keys(MOOD_COLORS).map(m => (
                <button key={m} className={filterMood === m ? 'chip active' : 'chip'} onClick={() => setFilterMood(m)} style={filterMood === m ? { backgroundColor: MOOD_COLORS[m], color: '#000' } : {}}>{MOOD_LABELS[m].toUpperCase()}</button>
              ))}
            </div>
          </div>

          <div className="entries-list">
            {loading ? <p className="status-text">Carregando registros...</p> : 
              filteredEntries.length === 0 ? <p className="status-text">Nenhum registro encontrado.</p> :
              filteredEntries.map(e => (
                <div key={e.id} className="entry-card" style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}>
                  <div className="entry-header">
                    <span style={{color: MOOD_COLORS[e.mood], fontWeight: 'bold'}}>{MOOD_LABELS[e.mood].toUpperCase()}</span>
                    <span>{new Date(e.date).toLocaleDateString('pt-BR')}</span>
                    <Trash2 size={18} onClick={() => deleteEntry(e.id)} style={{cursor: 'pointer', color: '#ff7f7f'}} />
                  </div>
                  <div className="entry-section-title">Situação</div><div className="entry-text">{e.situation}</div>
                  <div className="entry-section-title">Emoção</div><div className="entry-text">{e.emotion || '—'}</div>
                  <div className="entry-section-title">Pensamento</div><div className="entry-text">{e.thoughts}</div>
                  <div className="entry-section-title">Comportamento</div><div className="entry-text">{e.behavior || '—'}</div>
                </div>
              ))
            }
          </div>
        </>
      )}
    </div>
  );
}
