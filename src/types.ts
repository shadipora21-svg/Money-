export type TaskCategory = 'all' | 'game' | 'survey' | 'micro' | 'testing' | 'daily';

export type GameTaskType = 
  | 'speed-tap' 
  | 'memory-flip' 
  | 'math-blitz' 
  | 'spin' 
  | 'scratch' 
  | 'survey' 
  | 'tester';

export interface TaskItem {
  id: string;
  title: string;
  subtitle: string;
  category: TaskCategory;
  type: GameTaskType;
  rewardCoins: number;
  rewardCash: number;
  timeEstimate: string;
  difficulty: 'Easy' | 'Medium' | 'Fun' | 'High Reward';
  badge?: string;
  iconName: string;
  playsToday: number;
  maxPlaysPerDay: number;
  isHot?: boolean;
}

export interface UserProfile {
  coins: number;
  cashBalance: number;
  totalEarnedCash: number;
  totalWithdrawnCash: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastCheckInDate: string | null;
  spinsLeft: number;
  scratchesLeft: number;
  completedTasksCount: number;
  userName: string;
  userEmail: string;
  referralCode: string;
  referralsBonusClaimed: number;
  soundEnabled: boolean;
}

export interface Transaction {
  id: string;
  type: 'earned' | 'cashout' | 'bonus';
  title: string;
  amountCoins: number;
  amountCash: number;
  status: 'Completed' | 'Processing' | 'Pending';
  method?: string;
  recipient?: string;
  timestamp: string;
  referenceId?: string;
}

export interface PayoutMethod {
  id: string;
  name: string;
  icon: string;
  brandColor: string;
  minCash: number;
  options: number[]; // e.g. [1, 2, 5, 10, 25, 50]
  deliveryTime: string;
  feeText: string;
  placeholder: string;
  inputType: 'email' | 'phone' | 'address' | 'id';
  badge?: string;
  inrRate?: number;
  conversionNote?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface DailyRewardDay {
  day: number;
  coins: number;
  cash: number;
  mystery?: boolean;
}
