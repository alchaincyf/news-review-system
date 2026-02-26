'use client';

import {
  ClipboardPaste,
  BrainCircuit,
  FileCheck2,
  Scale,
  Layers,
  BookOpen,
  Sparkles,
  GitBranch,
  SpellCheck,
  FileText,
} from 'lucide-react';
import { DIMS } from '@/lib/constants';

const DIM_ICONS: Record<string, React.ReactNode> = {
  Scale: <Scale size={20} />,
  Layers: <Layers size={20} />,
  BookOpen: <BookOpen size={20} />,
  Sparkles: <Sparkles size={20} />,
  GitBranch: <GitBranch size={20} />,
  SpellCheck: <SpellCheck size={20} />,
};

interface EmptyStateProps {
  onLoadDemo: () => void;
}

export default function EmptyState({ onLoadDemo }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {/* 使用流程 */}
      <div className="empty-steps">
        <div className="empty-steps-title section-label">HOW IT WORKS</div>
        <div className="steps-row">
          <div className="step-item">
            <div className="step-icon">
              <ClipboardPaste size={24} />
            </div>
            <div className="step-num">01</div>
            <div className="step-label">粘贴文章</div>
            <div className="step-desc">将待评审的新闻稿粘贴到输入框</div>
          </div>
          <div className="step-connector">
            <div className="connector-line" />
          </div>
          <div className="step-item">
            <div className="step-icon">
              <BrainCircuit size={24} />
            </div>
            <div className="step-num">02</div>
            <div className="step-label">AI 智能分析</div>
            <div className="step-desc">DeepSeek V3 从 6 个维度深度评审</div>
          </div>
          <div className="step-connector">
            <div className="connector-line" />
          </div>
          <div className="step-item">
            <div className="step-icon">
              <FileCheck2 size={24} />
            </div>
            <div className="step-num">03</div>
            <div className="step-label">获取报告</div>
            <div className="step-desc">可视化评分 + 专业改进建议</div>
          </div>
        </div>
      </div>

      {/* 评审维度预览 */}
      <div className="empty-dimensions">
        <div className="empty-dims-title section-label">EVALUATION DIMENSIONS</div>
        <div className="dims-grid">
          {DIMS.map((dim) => (
            <div className="dim-card" key={dim.key}>
              <div className="dim-card-icon">{DIM_ICONS[dim.icon]}</div>
              <div className="dim-card-name">{dim.name}</div>
              <div className="dim-card-desc">{dim.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 快速体验 */}
      <div className="empty-cta">
        <button className="btn-demo" onClick={onLoadDemo}>
          <FileText size={16} />
          加载示例新闻稿
        </button>
        <span className="cta-hint">体验完整评审流程</span>
      </div>
    </div>
  );
}
