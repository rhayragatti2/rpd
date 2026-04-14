import React from 'react';
import { Search, Download } from 'lucide-react';
import { MOOD_COLORS, MOOD_LABELS } from '../constants/moods';

export default function SearchBar({ search, setSearch, filterMood, setFilterMood, onExport }) {
  return (
    <div className="search-section">
      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={18} color="#a1a1aa" />
          <input
            placeholder="BUSCAR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar registros"
          />
        </div>
        <button onClick={onExport} className="download-btn-modern" aria-label="Exportar PDF">
          <Download size={24} />
        </button>
      </div>
      <div className="filter-chips" role="radiogroup" aria-label="Filtrar por humor">
        <button
          role="radio"
          aria-checked={filterMood === 'all'}
          className={filterMood === 'all' ? 'chip active' : 'chip'}
          onClick={() => setFilterMood('all')}
        >
          TODOS
        </button>
        {Object.keys(MOOD_COLORS).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={filterMood === m}
            className={filterMood === m ? 'chip active' : 'chip'}
            onClick={() => setFilterMood(m)}
            style={filterMood === m ? { backgroundColor: MOOD_COLORS[m], color: '#000' } : {}}
          >
            {MOOD_LABELS[m].toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
