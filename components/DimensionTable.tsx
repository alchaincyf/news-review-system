'use client';

import { useEffect, useRef } from 'react';
import {
  Scale,
  Layers,
  BookOpen,
  Sparkles,
  GitBranch,
  SpellCheck,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { DIMS } from '@/lib/constants';
import { animateNumber } from '@/lib/animations';
import type { ReviewData, LanguageScore } from '@/lib/types';

const DIM_ICONS: Record<string, React.ReactNode> = {
  Scale: <Scale size={14} color="#9B9691" />,
  Layers: <Layers size={14} color="#9B9691" />,
  BookOpen: <BookOpen size={14} color="#9B9691" />,
  Sparkles: <Sparkles size={14} color="#9B9691" />,
  GitBranch: <GitBranch size={14} color="#9B9691" />,
  SpellCheck: <SpellCheck size={14} color="#9B9691" />,
};

interface DimensionTableProps {
  data: ReviewData;
}

function DimensionRow({
  dim,
  score,
  comment,
  isLowest,
  delay,
}: {
  dim: (typeof DIMS)[0];
  score: number;
  comment: string;
  isLowest: boolean;
  delay: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (rowRef.current) rowRef.current.classList.add('animate-in');
      if (scoreRef.current) animateNumber(scoreRef.current, score, 1000);
      setTimeout(() => {
        if (barRef.current) barRef.current.style.width = score + '%';
      }, 100);
    }, delay);

    return () => clearTimeout(timer);
  }, [score, delay]);

  const colorClass = isLowest ? 'color-low' : 'color-high';

  return (
    <div className="dim-row" ref={rowRef}>
      <div className="dim-name">
        {DIM_ICONS[dim.icon]}
        {dim.name}
      </div>
      <div className="dim-score num" ref={scoreRef}>
        0
      </div>
      <div className="dim-bar-wrap">
        <div className={`dim-bar ${colorClass}`} ref={barRef} />
      </div>
      <div className="dim-comment">{comment}</div>
    </div>
  );
}

export default function DimensionTable({ data }: DimensionTableProps) {
  const scores = DIMS.map((d) => data[d.key].score);
  const minScore = Math.min(...scores);
  const languageData = data.language as LanguageScore;
  const corrections = languageData?.corrections || [];

  return (
    <div className="dimensions-section">
      <div className="dimensions-header">
        <BarChart3 size={14} color="#9B9691" />
        <span className="section-label">DIMENSION BREAKDOWN</span>
      </div>
      <div className="dim-table">
        {DIMS.map((dim, i) => (
          <DimensionRow
            key={dim.key}
            dim={dim}
            score={data[dim.key].score}
            comment={data[dim.key].comment}
            isLowest={data[dim.key].score === minScore}
            delay={i * 120}
          />
        ))}
      </div>

      {corrections.length > 0 && (
        <div className="corrections-section">
          <div className="corrections-header">
            <SpellCheck size={14} color="#E3120B" />
            <span className="corrections-title">发现 {corrections.length} 处语言问题</span>
          </div>
          <div className="corrections-list">
            {corrections.map((c, i) => (
              <div className="correction-item" key={i}>
                <span className="correction-type">{c.type}</span>
                <div className="correction-detail">
                  <span className="correction-original">{c.original}</span>
                  <ArrowRight size={12} color="#9B9691" />
                  <span className="correction-fixed">{c.corrected}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
