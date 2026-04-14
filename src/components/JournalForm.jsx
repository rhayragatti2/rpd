import React, { useState, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { MOOD_COLORS, MOOD_LABELS } from '../constants/moods';
import { useToast } from './Toast';

const INITIAL_FORM = { situation: '', emotion: '', thoughts: '', behavior: '', mood: 'neutral' };

export default function JournalForm({ onSubmit, currentMood, onMoodChange }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [dateType, setDateType] = useState('hoje');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const addToast = useToast();

  const handleMoodChange = useCallback((e) => {
    const mood = e.target.value;
    setFormData((prev) => ({ ...prev, mood }));
    onMoodChange(mood);
  }, [onMoodChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.situation) {
      addToast('Preencha o campo Situação.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(formData, dateType, customDate);
      setFormData(INITIAL_FORM);
      onMoodChange('neutral');
      setDateType('hoje');
      addToast('Registro salvo com sucesso!', 'success');
    } catch (err) {
      addToast('Erro ao salvar: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="mood-select">Qual o seu tom agora?</label>
        <select
          id="mood-select"
          value={formData.mood}
          onChange={handleMoodChange}
          style={{ borderLeft: `6px solid ${MOOD_COLORS[formData.mood]}` }}
        >
          {Object.entries(MOOD_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="situation">Situação</label>
        <textarea id="situation" placeholder="O que aconteceu?" value={formData.situation} onChange={(e) => setFormData({ ...formData, situation: e.target.value })} />
      </div>
      <div className="form-group">
        <label htmlFor="emotion">Emoção</label>
        <textarea id="emotion" placeholder="O que sentiu?" value={formData.emotion} onChange={(e) => setFormData({ ...formData, emotion: e.target.value })} />
      </div>
      <div className="form-group">
        <label htmlFor="thoughts">Pensamento</label>
        <textarea id="thoughts" placeholder="O que pensou?" value={formData.thoughts} onChange={(e) => setFormData({ ...formData, thoughts: e.target.value })} />
      </div>
      <div className="form-group">
        <label htmlFor="behavior">Comportamento</label>
        <textarea id="behavior" placeholder="O que fez?" value={formData.behavior} onChange={(e) => setFormData({ ...formData, behavior: e.target.value })} />
      </div>

      <div className="form-group date-selection">
        <label>Quando aconteceu?</label>
        <div className="date-chips" role="radiogroup" aria-label="Selecionar data">
          {['hoje', 'ontem', 'outro'].map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={dateType === t}
              className={dateType === t ? 'chip active' : 'chip'}
              onClick={() => setDateType(t)}
            >
              {t === 'outro' ? 'OUTRA DATA' : t.toUpperCase()}
            </button>
          ))}
        </div>
        {dateType === 'outro' && (
          <input
            type="date"
            className="custom-date-input"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            aria-label="Escolher data"
          />
        )}
      </div>
      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? <span className="spinner" /> : <CheckCircle2 size={22} />}
        SALVAR NO DIÁRIO
      </button>
    </form>
  );
}
