import React, { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { MOOD_COLORS, MOOD_LABELS } from '../constants/moods';
import { ConfirmModal } from './Toast';

export default function EntryList({ entries, loading, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget) {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete]);

  if (loading) {
    return <p className="status-text">Carregando registros...</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum registro encontrado.</p>
        <p className="empty-hint">Comece registrando seus pensamentos acima.</p>
      </div>
    );
  }

  return (
    <section className="entries-list" aria-label="Histórico de registros">
      {deleteTarget && (
        <ConfirmModal
          message="Excluir este registro permanentemente?"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {entries.map((e) => (
        <div key={e.id} className="entry-card" style={{ borderLeft: `6px solid ${MOOD_COLORS[e.mood]}` }}>
          <div className="entry-header">
            <span style={{ color: MOOD_COLORS[e.mood], fontWeight: 'bold' }}>
              {MOOD_LABELS[e.mood].toUpperCase()}
            </span>
            <span>{new Date(e.date).toLocaleDateString('pt-BR')}</span>
            <button
              className="icon-btn-delete"
              onClick={() => setDeleteTarget(e.id)}
              aria-label="Excluir registro"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="entry-section-title">Situação</div>
          <div className="entry-text">{e.situation}</div>
          <div className="entry-section-title">Emoção</div>
          <div className="entry-text">{e.emotion || '—'}</div>
          <div className="entry-section-title">Pensamento</div>
          <div className="entry-text">{e.thoughts}</div>
          <div className="entry-section-title">Comportamento</div>
          <div className="entry-text">{e.behavior || '—'}</div>
        </div>
      ))}
    </section>
  );
}
