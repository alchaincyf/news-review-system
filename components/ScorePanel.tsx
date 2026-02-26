'use client';

import { useEffect, useRef } from 'react';
import { Award, ThumbsUp, Minus, AlertTriangle } from 'lucide-react';
import { getScoreTier } from '@/lib/constants';
import { animateNumber } from '@/lib/animations';

interface ScorePanelProps {
  totalScore: number;
}

const TIER_ICONS: Record<string, React.ReactNode> = {
  Award: <Award size={13} />,
  ThumbsUp: <ThumbsUp size={13} />,
  Minus: <Minus size={13} />,
  AlertTriangle: <AlertTriangle size={13} />,
};

export default function ScorePanel({ totalScore }: ScorePanelProps) {
  const scoreRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  const tier = getScoreTier(totalScore);

  useEffect(() => {
    if (scoreRef.current) {
      animateNumber(scoreRef.current, totalScore, 1400);
    }
    if (markerRef.current) {
      setTimeout(() => {
        if (markerRef.current) {
          markerRef.current.style.left = totalScore + '%';
        }
      }, 200);
    }
  }, [totalScore]);

  return (
    <div className="score-panel">
      <div className="label">COMPOSITE SCORE</div>
      <div className="score-big num">
        <span ref={scoreRef}>0</span>
        <span className="out-of"> / 100</span>
      </div>
      <div className={`score-grade ${tier.cls}`}>
        {TIER_ICONS[tier.icon]}
        {' '}{tier.text}
      </div>
      <div className="spectrum-wrap">
        <div className="spectrum-labels">
          <span>0 待改进</span>
          <span>60</span>
          <span>80</span>
          <span>100 优秀</span>
        </div>
        <div className="spectrum-bar">
          <div className="spectrum-marker" ref={markerRef} />
        </div>
      </div>
    </div>
  );
}
