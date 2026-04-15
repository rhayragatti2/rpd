import React, { useState, useMemo, useCallback } from 'react';
import { Mail, Lock, Save, LogOut, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MOOD_LABELS } from '../constants/moods';
import { useToast } from './Toast';

export default function ProfileView({ user, userName, setUserName, onSave, onLogout, onResetPassword, entries }) {
  const [saving, setSaving] = useState(false);
  const addToast = useToast();

  const monthCount = useMemo(() => {
    const now = new Date();
    return entries.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [entries]);

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
      addToast('E-mail de redefinição enviado!', 'success');
    } catch (err) {
      addToast('Erro: ' + err.message, 'error');
    }
  };

  const exportPDF = useCallback(() => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const name = userName ? userName.toUpperCase() : 'USUÁRIO';

    doc.setFontSize(18);
    doc.text(`MINDLOG - HISTÓRICO DE ${name}`, 14, 15);

    const rows = entries.map((e) => [
      new Date(e.date).toLocaleDateString('pt-BR'),
      MOOD_LABELS[e.mood].toUpperCase(),
      e.situation,
      e.emotion || '—',
      e.thoughts || '—',
      e.behavior || '—',
    ]);

    doc.autoTable({
      head: [['DATA', 'TOM', 'SITUAÇÃO', 'EMOÇÃO', 'PENSAMENTO', 'COMPORTAMENTO']],
      body: rows,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [22, 22, 24] },
      columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 35 } },
    });

    doc.save(`mindlog-${name.toLowerCase()}.pdf`);
    addToast('PDF exportado!', 'success');
  }, [entries, userName, addToast]);

  return (
    <section className="view-fade" aria-label="Meu perfil">
      <div className="card">
        <h2 className="section-title">Meu perfil</h2>
        <div className="form-group">
          <label htmlFor="profile-name" className="form-label">Nome</label>
          <input id="profile-name" type="text" placeholder="Como quer ser chamado?" value={userName} onChange={(e) => setUserName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">E-mail</label>
          <div className="input-with-icon readonly">
            <Mail size={16} color="#555" />
            <input type="text" value={user.email} readOnly />
          </div>
        </div>
        <div className="form-group">
          <button type="button" className="btn-link" onClick={handleResetPassword}>
            <Lock size={14} /> Alterar senha
          </button>
        </div>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ marginBottom: 10 }}>
          {saving ? <span className="spinner" /> : <Save size={18} />}
          Salvar alterações
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">Relatório</h2>
        <p className="stat-text">Você registrou <strong>{monthCount}</strong> pensamentos este mês.</p>
        <button className="btn-secondary" onClick={exportPDF}>
          <Download size={18} /> Exportar PDF para terapeuta
        </button>
      </div>

      <div className="card">
        <button className="btn-danger-outline" onClick={onLogout}>
          <LogOut size={18} /> Sair da conta
        </button>
      </div>

      <p className="about-text">MindLog v1.0 — Ferramenta de apoio ao autoconhecimento</p>
    </section>
  );
}
