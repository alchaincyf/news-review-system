'use client';

import { useEffect, useRef } from 'react';
import { PenLine } from 'lucide-react';
import { detectSuggestionTag, highlightKeywords } from '@/lib/constants';

interface SuggestionsProps {
  suggestions: string[];
}

function SuggestionItem({
  text,
  index,
  delay,
}: {
  text: string;
  index: number;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const tag = detectSuggestionTag(text);
  const highlighted = highlightKeywords(text);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) ref.current.classList.add('animate-in');
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="suggestion-item" ref={ref}>
      <div className="suggestion-num">{index + 1}</div>
      <div className="suggestion-body">
        <div className="suggestion-tag">{tag}</div>
        <div
          className="suggestion-text"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    </div>
  );
}

export default function Suggestions({ suggestions }: SuggestionsProps) {
  return (
    <div className="suggestions-section">
      <div className="suggestions-header">
        <PenLine size={14} color="#9B9691" />
        <span className="section-label">EDITORIAL SUGGESTIONS</span>
      </div>
      <div>
        {suggestions.map((text, i) => (
          <SuggestionItem
            key={i}
            text={text}
            index={i}
            delay={800 + i * 200}
          />
        ))}
      </div>
    </div>
  );
}
