import React from 'react';
import { BookOpen, BarChart3, User } from 'lucide-react';

const TABS = [
  { id: 'home', icon: BookOpen, label: 'Hoje' },
  { id: 'insights', icon: BarChart3, label: 'Insights' },
  { id: 'profile', icon: User, label: 'Perfil' },
];

export default function BottomNav({ view, setView }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegação principal">
      {TABS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`nav-item ${view === id ? 'active' : ''}`}
          onClick={() => setView(id)}
          aria-label={label}
          aria-current={view === id ? 'page' : undefined}
        >
          <Icon size={22} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
