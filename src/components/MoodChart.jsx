import React, { useMemo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MOOD_COLORS, MOOD_LABELS, MOOD_KEYS } from '../constants/moods';

ChartJS.register(ArcElement, Tooltip, Legend);

if (!Tooltip.positioners.cursor) {
  Tooltip.positioners.cursor = function (_elements, eventPosition) {
    return { x: eventPosition.x, y: eventPosition.y };
  };
}

export default function MoodChart({ entries, currentMonth }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthEntries = useMemo(() =>
    entries.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    }),
  [entries, year, month]);

  const chartData = useMemo(() => ({
    labels: Object.values(MOOD_LABELS),
    datasets: [{
      data: MOOD_KEYS.map((m) => monthEntries.filter((e) => e.mood === m).length),
      backgroundColor: Object.values(MOOD_COLORS),
      borderWidth: 0,
    }],
  }), [monthEntries]);

  const total = monthEntries.length;

  const options = {
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#7a7a85', usePointStyle: true, padding: 14, font: { size: 11 } },
      },
      tooltip: {
        position: 'cursor',
        backgroundColor: '#1c1c1f',
        borderColor: '#222225',
        borderWidth: 1,
        titleColor: '#e8e8eb',
        bodyColor: '#7a7a85',
        caretPadding: 8,
      },
    },
  };

  if (total === 0) {
    return (
      <div className="empty-state">
        <p>Nenhum registro neste mês.</p>
      </div>
    );
  }

  return (
    <div className="chart-container chart-container--doughnut">
      <Doughnut data={chartData} options={options} />
      <div className="doughnut-center">
        <span className="doughnut-center__number">{total}</span>
        <span className="doughnut-center__label">{total === 1 ? 'registro' : 'registros'}</span>
      </div>
    </div>
  );
}
