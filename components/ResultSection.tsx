'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ScorePanel from './ScorePanel';
import DimensionTable from './DimensionTable';
import Suggestions from './Suggestions';
import type { ReviewData } from '@/lib/types';
import { DIMS } from '@/lib/constants';

const RadarChart = dynamic(() => import('./RadarChart'), { ssr: false });

interface ResultSectionProps {
  data: ReviewData;
}

export default function ResultSection({ data }: ResultSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const scores = DIMS.map((d) => data[d.key].score);
  const totalScore = Math.round(scores.reduce((a, b) => a + b, 0) / 5);

  useEffect(() => {
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }, []);

  return (
    <section className="result-section visible" ref={sectionRef}>
      <div className="top-row">
        <ScorePanel totalScore={totalScore} />
        <RadarChart scores={scores} />
      </div>
      <DimensionTable data={data} />
      <Suggestions suggestions={data.suggestions || []} />
    </section>
  );
}
