import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '新闻稿智能评审系统',
  description: 'AI驱动的新闻稿专业评审工具，从客观性、信息密度、可读性、标题吸引力、结构完整度五大维度进行深度分析',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
