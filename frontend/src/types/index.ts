export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales_rep';
  createdAt: string;
}

export interface Sentiment {
  positive: number;
  neutral: number;
  negative: number;
}

export interface CallAnalysis {
  summary: string;
  sentiment: Sentiment;
  objections: string[];
  followUpSuggestions: string[];
  salesScore: number;
  keyInsights: string[];
  callOutcome: 'positive' | 'neutral' | 'negative';
  isAnalyzed: boolean;
}

export interface Call {
  _id: string;
  userId: string;
  title: string;
  customerName: string;
  salesRepName: string;
  transcript?: string;
  callDate: string;
  analysis: CallAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsOverview {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  avgScore: number;
}

export interface TrendPoint {
  _id: string;
  count: number;
  avgScore: number;
  positive: number;
  negative: number;
}

export interface TopObjection {
  _id: string;
  count: number;
}

export interface Analytics {
  overview: AnalyticsOverview;
  trend: TrendPoint[];
  topObjections: TopObjection[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface PaginatedCalls {
  calls: Call[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
