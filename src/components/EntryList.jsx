import React, { useState, useCallback } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';
import { MOOD_COLORS, MOOD_SHORT } from '../constants/moods';
import { ConfirmModal } from './Toast';

function EntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const color = MOOD_COLORS[entry.mood];
  const dateStr = new Date(entry.date).toLocaleDateString('pt-BR');
  const preview = entry.situation?.length > 60
    ? entry.situation.substring(0, 60) + '...'
    : entry.situation;

  return (
    <div className={`entry-card ${expanded ? 'entry-card--expanded' : ''}`}>
      <button
        className="entry-card__header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="entry-card__dot" style={{ backgroundColor: color }} />
        <div className="entry-card__summary">
          <span className="entry-card__preview">{preview || 'Sem descrição'}</span>
          <span className="entry-card__meta">
            {MOOD_SHORT[entry.mood]} &middot; {dateStr}
          </span>
        </div>
        <ChevronDown size={16} className={`entry-card__chevron ${expanded ? 'entry-card__chevron--open' : ''}`} />
      </button>

      <div className="entry-card__body">
        <div className="entry-field">
          <span className="entry-field__label">Situação</span>
          <p className="entry-field__text">{entry.situation}</p>
        </div>
        {entry.emotion && (
          <div className="entry-field">
            <span className="entry-field__label">Emoção</span>
            <p className="entry-field__text">{entry.emotion}</p>
          </div>
        )}
        {entry.thoughts && (
          <div className="entry-field">
            <span className="entry-field__label">Pensamento</span>
            <p className="entry-field__text">{entry.thoughts}</p>
          </div>
        )}
        {entry.behavior && (
          <div className="entry-field">
            <span className="entry-field__label">Comportamento</span>
            <p className="entry-field__text">{entry.behavior}</p>
          </div>
        )}
        <button className="entry-card__delete" onClick={() => onDelete(entry.id)} aria-label="Excluir registro">
          <Trash2 size={16} /> Excluir
        </button>
      </div>
    </div>
  );
}

export default function EntryList({ entries, loading, onDelete }) {
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteTarget) {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  }, [deleteTarget, onDelete]);

  const handleRequestDelete = useCallback((id) => {
    setDeleteTarget(id);
  }, []);

  if (loading) {
    return <div className="empty-state"><span className="spinner spinner-lg" /></div>;
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum registro encontrado.</p>
        <p className="empty-hint">Comece registrando seus pensamentos.</p>
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
        <EntryCard key={e.id} entry={e} onDelete={handleRequestDelete} />
      ))}
    </section>
  );
}
