'use client';

import { useState, useCallback } from 'react';
import TopNav from '@/components/TopNav';
import ArticleInput from '@/components/ArticleInput';
import EmptyState from '@/components/EmptyState';
import LoadingOverlay from '@/components/LoadingOverlay';
import ResultSection from '@/components/ResultSection';
import type { AppState, ReviewData } from '@/lib/types';
import { DIMS, DEMO_ARTICLE } from '@/lib/constants';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [articleValue, setArticleValue] = useState('');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = useCallback(async (article: string) => {
    setAppState('loading');
    setReviewData(null);
    setError('');

    try {
      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article }),
      });

      const json = await resp.json();

      if (!resp.ok || json.error) {
        throw new Error(json.error || '请求失败，请重试');
      }

      const data: ReviewData = json.data;

      // Validate data structure
      for (const dim of DIMS) {
        if (!data[dim.key] || typeof data[dim.key].score !== 'number') {
          throw new Error('AI返回的数据结构不完整，请重试');
        }
      }

      setReviewData(data);
      setAppState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      setAppState('idle');
    }
  }, []);

  const handleLoadDemo = useCallback(() => {
    setArticleValue(DEMO_ARTICLE);
  }, []);

  return (
    <>
      <TopNav />
      <div className="container">
        <ArticleInput
          onAnalyze={handleAnalyze}
          isLoading={appState === 'loading'}
          articleValue={articleValue}
          onArticleChange={setArticleValue}
        />

        {error && (
          <div className="error-banner visible" style={{ marginBottom: 16 }}>
            <span>{error}</span>
          </div>
        )}

        {appState === 'idle' && !reviewData && (
          <EmptyState onLoadDemo={handleLoadDemo} />
        )}

        {appState === 'result' && reviewData && (
          <ResultSection data={reviewData} />
        )}

        <div className="footer">
          Powered by DeepSeek V3 &middot; 新闻稿智能评审系统
        </div>
      </div>

      <LoadingOverlay visible={appState === 'loading'} />
    </>
  );
}
