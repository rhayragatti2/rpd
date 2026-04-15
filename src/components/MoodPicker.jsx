import React from 'react';
import { MOOD_COLORS, MOOD_SHORT, MOOD_KEYS } from '../constants/moods';

export default function MoodPicker({ value, onChange }) {
  return (
    <div className="mood-picker" role="radiogroup" aria-label="Selecionar humor">
      {MOOD_KEYS.map((key) => {
        const isSelected = value === key;
        const color = MOOD_COLORS[key];
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isSelected}
            className={`mood-btn ${isSelected ? 'mood-btn--active' : ''}`}
            onClick={() => onChange(key)}
            style={{
              '--mood-color': color,
              '--mood-color-dim': `${color}33`,
              '--mood-glow': `${color}55`,
            }}
          >
            <span className="mood-btn__dot" />
            <span className="mood-btn__label">{MOOD_SHORT[key]}</span>
          </button>
        );
      })}
    </div>
  );
}
