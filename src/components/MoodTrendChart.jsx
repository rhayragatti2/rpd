import React, { useMemo } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MOOD_SCORE } from '../constants/moods';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

if (!Tooltip.positioners.cursor) {
  Tooltip.positioners.cursor = function (_elements, eventPosition) {
    return { x: eventPosition.x, y: eventPosition.y };
  };
}

export default function MoodTrendChart({ entries, currentMonth }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const chartData = useMemo(() => {
    const monthEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const dayMap = new Map();
    monthEntries.forEach((e) => {
      const day = new Date(e.date).getDate();
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day).push(MOOD_SCORE[e.mood] || 4);
    });

    const labels = [];
    const data = [];
    for (let d = 1; d <= daysInMonth; d++) {
      labels.push(d);
      const scores = dayMap.get(d);
      if (scores) {
        data.push(scores.reduce((a, b) => a + b, 0) / scores.length);
      } else {
        data.push(null);
      }
    }

    return {
      labels,
      datasets: [{
        data,
        borderColor: '#6ee7a0',
        backgroundColor: 'rgba(110, 231, 160, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: (ctx) => data[ctx.dataIndex] !== null ? 3 : 0,
        pointBackgroundColor: '#6ee7a0',
        spanGaps: true,
        borderWidth: 2,
      }],
    };
  }, [entries, year, month, daysInMonth]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#7a7a85',
          font: { size: 10 },
          maxTicksLimit: 10,
        },
      },
      y: {
        min: 0.5,
        max: 5.5,
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#7a7a85',
          font: { size: 10 },
          stepSize: 1,
          callback: (v) => {
            const map = { 1: 'Bravo', 2: 'Triste', 3: 'Ansioso', 4: 'Neutro', 5: 'Feliz' };
            return map[v] || '';
          },
        },
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: false,
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
        callbacks: {
          label: (ctx) => {
            const map = { 1: 'Bravo', 2: 'Triste', 3: 'Ansioso', 4: 'Neutro', 5: 'Feliz' };
            const v = Math.round(ctx.parsed.y);
            return map[v] || '';
          },
        },
      },
    },
  };

  return (
    <div className="chart-container">
      <Line data={chartData} options={options} />
    </div>
  );
}
