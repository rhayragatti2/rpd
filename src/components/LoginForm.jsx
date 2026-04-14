import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useToast } from './Toast';

export default function LoginForm({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isRegistering) {
        await onRegister(email, password);
        addToast('Conta criada com sucesso!', 'success');
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container login-screen">
      <header className="header">
        <div className="logo-icon" style={{ borderColor: '#fff' }}>
          <BrainCircuit size={42} />
        </div>
        <h1>MINDLOG</h1>
      </header>
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h2>{isRegistering ? 'CRIAR CONTA' : 'ACESSAR DIÁRIO'}</h2>
        <div className="form-group">
          <div className="search-input-wrapper">
            <Mail size={18} color="#a1a1aa" />
            <input
              type="email"
              placeholder="E-MAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>
        <div className="form-group">
          <div className="search-input-wrapper">
            <Lock size={18} color="#a1a1aa" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="SENHA"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? (
            <span className="spinner" />
          ) : isRegistering ? (
            <UserPlus size={20} />
          ) : (
            <LogIn size={20} />
          )}
          {isRegistering ? 'CADASTRAR' : 'ENTRAR'}
        </button>
        <p className="toggle-auth" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
        </p>
      </form>
    </div>
  );
}
