import React from 'react';
import { BookOpen, User } from 'lucide-react';

export default function BottomNav({ view, setView }) {
  return (
    <nav className="bottom-nav" role="navigation" aria-label="Navegação principal">
      <button
        className={view === 'journal' ? 'nav-item active' : 'nav-item'}
        onClick={() => setView('journal')}
        aria-label="Diário"
        aria-current={view === 'journal' ? 'page' : undefined}
      >
        <BookOpen size={24} />
        <span>Diário</span>
      </button>
      <button
        className={view === 'profile' ? 'nav-item active' : 'nav-item'}
        onClick={() => setView('profile')}
        aria-label="Perfil"
        aria-current={view === 'profile' ? 'page' : undefined}
      >
        <User size={24} />
        <span>Perfil</span>
      </button>
    </nav>
  );
}
