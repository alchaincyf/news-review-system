'use client';

interface LoadingOverlayProps {
  visible: boolean;
}

export default function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="loading-overlay visible">
      <div className="loading-ring" />
      <div className="loading-text">AI 正在评审中</div>
      <div className="loading-subtext">通常需要 10-20 秒，请稍候</div>
    </div>
  );
}
