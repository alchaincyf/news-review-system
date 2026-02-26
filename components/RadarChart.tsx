'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Radar as RadarIcon } from 'lucide-react';
import { DIMS } from '@/lib/constants';
import { easeOutExpo } from '@/lib/animations';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface RadarChartProps {
  scores: number[];
}

export default function RadarChart({ scores }: RadarChartProps) {
  const chartRef = useRef<ChartJS<'radar'>>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    // Start from zero, animate to target
    chart.data.datasets[0].data = [0, 0, 0, 0, 0];
    chart.update('none');

    let cancelled = false;
    const duration = 1200;
    const startTime = performance.now();

    function animate(now: number) {
      if (cancelled) return;
      const c = chartRef.current;
      if (!c || !c.canvas) return;

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);

      c.data.datasets[0].data = scores.map((s) => Math.round(s * eased));
      c.update('none');

      if (progress < 1) requestAnimationFrame(animate);
    }

    const timer = setTimeout(() => requestAnimationFrame(animate), 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scores]);

  const data = {
    labels: DIMS.map((d) => d.name),
    datasets: [
      {
        label: '评分',
        data: [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(13, 118, 128, 0.1)',
        borderColor: '#0D7680',
        borderWidth: 2,
        pointBackgroundColor: '#0D7680',
        pointBorderColor: '#0D7680',
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 0 },
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { size: 10 },
          color: '#9B9691',
          backdropColor: 'transparent',
        },
        grid: { color: '#D7D2CB', lineWidth: 1 },
        angleLines: { color: '#D7D2CB', lineWidth: 1 },
        pointLabels: {
          font: {
            size: 12,
            weight: 500 as const,
            family: 'Georgia, "Noto Serif SC", "Times New Roman", serif',
          },
          color: '#1D1D1B',
          padding: 16,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1D1D1B',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
        cornerRadius: 2,
        padding: 8,
        callbacks: {
          label: (ctx: { raw: unknown }) => ` ${ctx.raw} 分`,
        },
      },
    },
  };

  return (
    <div className="radar-panel">
      <div className="panel-header">
        <RadarIcon size={14} color="#9B9691" />
        <span className="section-label">MULTI-DIMENSION ANALYSIS</span>
      </div>
      <div className="radar-canvas-wrap">
        <div style={{ maxWidth: 340, maxHeight: 340, width: '100%' }}>
          <Radar ref={chartRef} data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
