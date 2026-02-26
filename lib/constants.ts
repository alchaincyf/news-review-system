import { DimensionConfig, ScoreTier } from './types';

export const DIMS: DimensionConfig[] = [
  { key: 'objectivity', name: '客观性', icon: 'Scale', description: '是否客观中立，有无主观臆断' },
  { key: 'density', name: '信息密度', icon: 'Layers', description: '单位篇幅内有效信息量' },
  { key: 'readability', name: '可读性', icon: 'BookOpen', description: '语言是否流畅，逻辑是否清晰' },
  { key: 'headline', name: '标题吸引力', icon: 'Sparkles', description: '标题是否准确且有吸引力' },
  { key: 'structure', name: '结构完整度', icon: 'GitBranch', description: '导语、主体、结尾是否完整' },
];

export function getScoreTier(score: number): ScoreTier {
  if (score >= 85) return { text: '优秀', cls: 'grade-excellent', icon: 'Award' };
  if (score >= 70) return { text: '良好', cls: 'grade-good', icon: 'ThumbsUp' };
  if (score >= 55) return { text: '一般', cls: 'grade-average', icon: 'Minus' };
  return { text: '待改进', cls: 'grade-poor', icon: 'AlertTriangle' };
}

export function detectSuggestionTag(text: string): string {
  if (/标题/.test(text)) return '标题优化';
  if (/信源|据了解|据悉/.test(text)) return '信源规范';
  if (/结尾|结束|闭环/.test(text)) return '结尾完善';
  if (/数据|数字/.test(text)) return '数据补充';
  if (/段落|结构/.test(text)) return '结构调整';
  return '内容优化';
}

export function highlightKeywords(text: string): string {
  return text.replace(/「([^」]+)」/g, '<em>「$1」</em>');
}

export const DEMO_ARTICLE = `新华社北京2月26日电（记者张三）记者从住房和城乡建设部获悉，2025年全国城市更新行动取得显著成效，全年完成投资超过3万亿元，惠及居民超过5000万户。

据了解，住建部今年重点推进了老旧小区改造、城市基础设施更新、历史文化保护等三大领域。其中，老旧小区改造完成5.3万个，超额完成年度目标的106%。

住建部相关负责人表示，城市更新不是简单的"拆旧建新"，而是要在保留城市记忆的基础上，提升城市功能和居民生活品质。"我们坚持'留改拆'并举，能保留的尽量保留，需要改造的精心改造。"

在资金保障方面，据悉中央财政今年安排城市更新专项资金1200亿元，同比增长15%。各地也积极创新融资模式，引入社会资本参与城市更新项目。

下一步，住建部将继续深入推进城市更新行动，计划在2026年完成老旧小区改造任务的80%，并启动新一轮城市基础设施体检工作。`;
