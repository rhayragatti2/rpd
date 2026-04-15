import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MOOD_COLORS, MOOD_SHORT, MOOD_KEYS } from '../constants/moods';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

if (!Tooltip.positioners.cursor) {
  Tooltip.positioners.cursor = function (_elements, eventPosition) {
    return { x: eventPosition.x, y: eventPosition.y };
  };
}

function getWeekOfMonth(date) {
  const d = new Date(date);
  return Math.ceil(d.getDate() / 7);
}

export default function MoodBarChart({ entries, currentMonth }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const chartData = useMemo(() => {
    const monthEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const weeks = [1, 2, 3, 4, 5];
    const labels = weeks.map((w) => `Sem ${w}`);

    const datasets = MOOD_KEYS.map((mood) => ({
      label: MOOD_SHORT[mood],
      data: weeks.map((w) =>
        monthEntries.filter((e) => e.mood === mood && getWeekOfMonth(e.date) === w).length
      ),
      backgroundColor: MOOD_COLORS[mood],
      borderRadius: 4,
      borderSkipped: false,
    }));

    return { labels, datasets };
  }, [entries, year, month]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#7a7a85', font: { size: 11 } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#7a7a85', stepSize: 1, font: { size: 11 } },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
    plugins: {
      legend: { display: false },
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

  return (
    <div className="chart-container">
      <Bar data={chartData} options={options} />
    </div>
  );
}
