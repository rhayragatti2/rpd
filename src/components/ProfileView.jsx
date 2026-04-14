import React, { useState } from 'react';
import { Mail, Lock, Save, LogOut } from 'lucide-react';
import { useToast } from './Toast';

export default function ProfileView({ user, userName, setUserName, onSave, onLogout, onResetPassword }) {
  const [saving, setSaving] = useState(false);
  const addToast = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(userName);
      addToast('Perfil atualizado!', 'success');
    } catch (err) {
      addToast('Erro ao salvar perfil: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      await onResetPassword(user.email);
      addToast('E-mail de redefinição de senha enviado!', 'success');
    } catch (err) {
      addToast('Erro: ' + err.message, 'error');
    }
  };

  return (
    <section className="profile-section" aria-label="Meu perfil">
      <div className="card">
        <h2>MEU PERFIL</h2>
        <div className="form-group">
          <label htmlFor="profile-name">Nome</label>
          <input
            id="profile-name"
            type="text"
            placeholder="Como quer ser chamado?"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>E-mail</label>
          <div className="search-input-wrapper readonly">
            <Mail size={18} color="#555" />
            <input type="text" value={user.email} readOnly />
          </div>
        </div>
        <div className="form-group">
          <button
            type="button"
            className="btn-reset-password"
            onClick={handleResetPassword}
          >
            <Lock size={16} /> ALTERAR SENHA
          </button>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginBottom: '10px' }}>
          {saving ? <span className="spinner" /> : <Save size={20} />}
          SALVAR ALTERAÇÕES
        </button>
        <button className="btn-secondary logout-full" onClick={onLogout}>
          <LogOut size={20} /> SAIR DA CONTA
        </button>
      </div>
    </section>
  );
}
