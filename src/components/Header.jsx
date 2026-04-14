import React from 'react';
import { BrainCircuit } from 'lucide-react';

export default function Header({ borderColor, userName }) {
  return (
    <header className="header">
      <div className="logo-icon" style={{ borderColor }}>
        <BrainCircuit size={42} strokeWidth={1.5} />
      </div>
      <h1>MINDLOG</h1>
      {userName && <p className="welcome-text">Olá, {userName}</p>}
    </header>
  );
}
