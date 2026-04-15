import React, { useState, useCallback } from 'react';
import { CheckCircle2, ChevronDown, Mic, MicOff } from 'lucide-react';
import { MOOD_COLORS } from '../constants/moods';
import { useToast } from './Toast';
import MoodPicker from './MoodPicker';
import { useSpeechToText } from '../hooks/useSpeechToText';

const INITIAL_FORM = { situation: '', emotion: '', thoughts: '', behavior: '', mood: 'neutral' };

export default function JournalForm({ onSubmit, currentMood, onMoodChange }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [dateType, setDateType] = useState('hoje');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const addToast = useToast();

  const handleSpeechResult = useCallback((transcript) => {
    setFormData((prev) => ({
      ...prev,
      situation: prev.situation
        ? prev.situation + ' ' + transcript
        : transcript,
    }));
  }, []);

  const handleSpeechError = useCallback((msg) => {
    addToast(msg, 'error');
  }, [addToast]);

  const { isListening, start, stop, supported } = useSpeechToText({
    lang: 'pt-BR',
    onResult: handleSpeechResult,
    onError: handleSpeechError,
  });

  const toggleMic = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  const handleMoodChange = useCallback((mood) => {
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
      setShowDetails(false);
      addToast('Registro salvo!', 'success');
    } catch (err) {
      addToast('Erro ao salvar: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <label className="form-label">Como você está?</label>
      <MoodPicker value={formData.mood} onChange={handleMoodChange} />

      <div className="form-group">
        <div className="label-with-mic">
          <label htmlFor="situation" className="form-label">O que aconteceu?</label>
          {supported && (
            <button
              type="button"
              className={`mic-btn ${isListening ? 'mic-btn--recording' : ''}`}
              onClick={toggleMic}
              aria-label={isListening ? 'Parar gravação' : 'Gravar áudio'}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              {isListening && <span className="mic-label">Ouvindo...</span>}
            </button>
          )}
        </div>
        <textarea
          id="situation"
          placeholder={isListening ? 'Fale agora...' : 'Descreva a situação...'}
          value={formData.situation}
          onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
          rows={3}
        />
      </div>

      <button
        type="button"
        className={`details-toggle ${showDetails ? 'details-toggle--open' : ''}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <span>Adicionar detalhes</span>
        <ChevronDown size={16} />
      </button>

      <div className={`details-panel ${showDetails ? 'details-panel--open' : ''}`}>
        <div className="form-group">
          <label htmlFor="emotion" className="form-label">Emoção</label>
          <textarea id="emotion" placeholder="O que sentiu?" value={formData.emotion} onChange={(e) => setFormData({ ...formData, emotion: e.target.value })} rows={2} />
        </div>
        <div className="form-group">
          <label htmlFor="thoughts" className="form-label">Pensamento</label>
          <textarea id="thoughts" placeholder="O que pensou?" value={formData.thoughts} onChange={(e) => setFormData({ ...formData, thoughts: e.target.value })} rows={2} />
        </div>
        <div className="form-group">
          <label htmlFor="behavior" className="form-label">Comportamento</label>
          <textarea id="behavior" placeholder="O que fez?" value={formData.behavior} onChange={(e) => setFormData({ ...formData, behavior: e.target.value })} rows={2} />
        </div>
      </div>

      <div className="form-group date-selection">
        <label className="form-label">Quando?</label>
        <div className="date-chips" role="radiogroup" aria-label="Selecionar data">
          {['hoje', 'ontem', 'outro'].map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={dateType === t}
              className={`chip ${dateType === t ? 'active' : ''}`}
              onClick={() => setDateType(t)}
            >
              {t === 'outro' ? 'Outra data' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {dateType === 'outro' && (
          <input type="date" className="custom-date-input" value={customDate} onChange={(e) => setCustomDate(e.target.value)} aria-label="Escolher data" />
        )}
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={submitting}
        style={{ '--accent-local': MOOD_COLORS[formData.mood] }}
      >
        {submitting ? <span className="spinner" /> : <CheckCircle2 size={20} />}
        Salvar registro
      </button>
    </form>
  );
}
