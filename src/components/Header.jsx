import React from 'react';
import { BrainCircuit } from 'lucide-react';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Boa madrugada';
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function formatToday() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function Header({ borderColor, userName, compact }) {
  if (compact) {
    return (
      <header className="header header--compact">
        <div>
          <h1 className="greeting-text">
            {getGreeting()}{userName ? `, ${userName}` : ''}
          </h1>
          <p className="date-text">{formatToday()}</p>
        </div>
        <div className="logo-icon logo-icon--small" style={{ borderColor }}>
          <BrainCircuit size={24} strokeWidth={1.5} />
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="logo-icon" style={{ borderColor }}>
        <BrainCircuit size={42} strokeWidth={1.5} />
      </div>
      <h1 className="app-title">MINDLOG</h1>
      {userName && <p className="welcome-text">{getGreeting()}, {userName}</p>}
    </header>
  );
}
