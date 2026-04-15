import React from 'react';
import { Search } from 'lucide-react';
import { MOOD_COLORS, MOOD_SHORT } from '../constants/moods';

export default function SearchBar({ search, setSearch, filterMood, setFilterMood }) {
  return (
    <div className="search-section">
      <div className="search-input-wrapper">
        <Search size={16} color="#7a7a85" />
        <input
          placeholder="Buscar registros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Buscar registros"
        />
      </div>
      <div className="filter-chips" role="radiogroup" aria-label="Filtrar por humor">
        <button
          role="radio"
          aria-checked={filterMood === 'all'}
          className={`chip ${filterMood === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMood('all')}
        >
          Todos
        </button>
        {Object.keys(MOOD_COLORS).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={filterMood === m}
            className={`chip ${filterMood === m ? 'active' : ''}`}
            onClick={() => setFilterMood(m)}
            style={filterMood === m ? { backgroundColor: MOOD_COLORS[m], color: '#000' } : {}}
          >
            {MOOD_SHORT[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
