export interface DimensionScore {
  score: number;
  comment: string;
}

export interface ReviewData {
  objectivity: DimensionScore;
  density: DimensionScore;
  readability: DimensionScore;
  headline: DimensionScore;
  structure: DimensionScore;
  suggestions: string[];
}

export interface DimensionConfig {
  key: keyof Omit<ReviewData, 'suggestions'>;
  name: string;
  icon: string;
  description: string;
}

export type AppState = 'idle' | 'loading' | 'result';

export interface ScoreTier {
  text: string;
  cls: string;
  icon: string;
}
