import React, { useState } from 'react';
import { BrainCircuit, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useToast } from './Toast';

function getAuthErrorMessage(err, isRegistering) {
  switch (err?.code) {
    case 'auth/invalid-credential':
      return 'E-mail ou senha inválidos. Confira os dados ou crie uma conta nova.';
    case 'auth/user-not-found':
      return 'Conta não encontrada. Crie uma conta para começar.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/email-already-in-use':
      return 'Este e-mail já está em uso. Faça login em vez de cadastrar.';
    case 'auth/invalid-email':
      return 'E-mail inválido. Verifique o formato digitado.';
    case 'auth/weak-password':
      return 'Senha fraca. Use pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de rede. Verifique sua conexão e tente novamente.';
    default:
      return isRegistering
        ? 'Não foi possível criar a conta agora.'
        : 'Não foi possível entrar agora.';
  }
}

export default function LoginForm({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    setSubmitting(true);
    try {
      if (isRegistering) {
        await onRegister(normalizedEmail, password);
        addToast('Conta criada com sucesso!', 'success');
      } else {
        await onLogin(normalizedEmail, password);
      }
    } catch (err) {
      addToast(getAuthErrorMessage(err, isRegistering), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-content">
        <header className="login-header">
          <div className="logo-icon logo-icon--animated">
            <BrainCircuit size={48} strokeWidth={1.5} />
          </div>
          <h1 className="app-title">MINDLOG</h1>
          <p className="login-tagline">Seu diário de pensamentos</p>
        </header>

        <form className="card glass-card auth-card" onSubmit={handleSubmit}>
          <h2 className="auth-title">{isRegistering ? 'Criar conta' : 'Entrar'}</h2>

          <div className="form-group">
            <div className="input-with-icon">
              <Mail size={16} color="#7a7a85" />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <Lock size={16} color="#7a7a85" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? (
              <span className="spinner" />
            ) : isRegistering ? (
              <UserPlus size={18} />
            ) : (
              <LogIn size={18} />
            )}
            {isRegistering ? 'Cadastrar' : 'Entrar'}
          </button>

          <p className="toggle-auth" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Já tem conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
          </p>
        </form>
      </div>
    </div>
  );
}
