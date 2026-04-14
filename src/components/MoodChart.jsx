import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MOOD_COLORS, MOOD_LABELS, MOOD_KEYS } from '../constants/moods';

ChartJS.register(ArcElement, Tooltip, Legend);

const chartOptions = {
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#a1a1aa', usePointStyle: true },
    },
  },
};

export default function MoodChart({ entries }) {
  const chartData = useMemo(() => ({
    labels: Object.values(MOOD_LABELS),
    datasets: [{
      data: MOOD_KEYS.map((m) => entries.filter((e) => e.mood === m).length),
      backgroundColor: Object.values(MOOD_COLORS),
      borderWidth: 0,
    }],
  }), [entries]);

  const hasData = entries.length > 0;

  return (
    <section className="card" aria-label="Gráfico de humor">
      {hasData ? (
        <div className="chart-wrapper">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="empty-state">
          <p>Registre seu primeiro pensamento para ver o gráfico de humor.</p>
        </div>
      )}
    </section>
  );
}
