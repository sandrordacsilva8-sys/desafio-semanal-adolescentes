export type ChallengeCategory = 'detox' | 'biblia' | 'comunhao' | 'social';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: ChallengeCategory;
  xp: number;
  ref: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  streak: number;
  completedChallenges: string[];
  reflections: Record<string, string>;
  bonusXP?: number;
  totalXP?: number;
  activeTimers?: Record<string, number>;
}

export type ViewState = 'teen' | 'admin' | 'bible' | 'library' | 'devotionals';

export interface LibraryBook {
  id: string;
  title: string;
  url?: string;
  isPdf?: boolean;
}

export interface VerseOfTheDay {
  text: string;
  reference: string;
}

export interface Devotional {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: any; // We'll use lucide-react icons, which are React components
  condition: (params: { completedCount: number; percent: number; detoxComplete: boolean }) => boolean;
}
