export interface ReviewFile {
  name: string;
  path: string;
  date?: string;
  slug: string;
  content: string;
  frontmatter: Record<string, any>;
  energyLevel?: number;
}

export interface LifeMapScores {
  career: number;
  relationships: number;
  health: number;
  finances: number;
  meaning: number;
  fun: number;
}

export interface Goal {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
}

export type ReviewType = 'daily' | 'weekly' | 'quarterly' | 'annual';
