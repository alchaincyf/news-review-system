'use client';

import { useCallback, useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface ArticleInputProps {
  onAnalyze: (article: string) => void;
  isLoading: boolean;
  articleValue: string;
  onArticleChange: (value: string) => void;
}

export default function ArticleInput({
  onAnalyze,
  isLoading,
  articleValue,
  onArticleChange,
}: ArticleInputProps) {
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    const article = articleValue.trim();
    if (!article) {
      setError('请先粘贴新闻稿内容');
      return;
    }
    if (article.length < 20) {
      setError('新闻稿内容过短，请至少输入20个字符');
      return;
    }
    setError('');
    onAnalyze(article);
  }, [articleValue, onAnalyze]);

  return (
    <section className="input-section">
      <div className="input-label">
        <span className="section-label">ARTICLE INPUT</span>
        <span className="input-hint">粘贴新闻稿全文，支持任意长度</span>
      </div>
      <textarea
        value={articleValue}
        onChange={(e) => onArticleChange(e.target.value)}
        placeholder="在此粘贴待评审的新闻稿内容..."
      />
      <div className="btn-row">
        <span className="char-count">{articleValue.length} 字</span>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner" />
              评审中...
            </>
          ) : (
            '开始评审'
          )}
        </button>
      </div>
      {error && (
        <div className="error-banner visible">
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
}
