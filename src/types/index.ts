// Core domain types for the Placement Prediction Dashboard

export interface StudentProfile {
  id: string;
  name: string;
  college: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  skills: string[];
  leetcodeSolved?: number;
  githubUrl?: string;
  leetcodeUrl?: string;
  resumeUrl?: string;
  email?: string;
  targets: {
    companies: string[];
    roles: string[];
    minPackageLPA: number;
  };
  integrationStatus: {
    github: 'connected' | 'not-connected' | 'pending';
    leetcode: 'connected' | 'not-connected' | 'pending';
    resume: 'uploaded' | 'not-uploaded' | 'parsing';
  };
}

export interface IntegrationProviderStatus {
  provider: 'github' | 'leetcode';
  connected: boolean;
  username: string | null;
  lastSyncAt: string | null;
  syncStatus: string;
  syncError: string | null;
  stats: Record<string, any> | null;
}

export interface IntegrationStatusResponse {
  providers: {
    github: IntegrationProviderStatus;
    leetcode: IntegrationProviderStatus;
  };
}

export interface PlacementSummary {
  overallPlacementProb: number; // 0–1
  highPackageProb20LpaPlus: number; // 0–1
  companyProbs: { [company: string]: number };
  totalProblemsSolved: number;
  currentStreak: number;
  dataFreshness?: {
    integrations: {
      github: {
        connected: boolean;
        username: string;
        lastSyncAt: string | null;
        syncStatus: string;
      } | null;
      leetcode: {
        connected: boolean;
        username: string;
        lastSyncAt: string | null;
        syncStatus: string;
      } | null;
    };
    companyMatchesLastComputedAt: string | null;
    usingExternalSignals: boolean;
  };
  lastUpdated: string;
}

export interface WeeklyPlanItem {
  id?: string;
  week: number;
  phase?: string;
  focusAreas: string[];
  targets: string[];
  expectedOutcomes: string[];
  reasoning?: string;
  priorityScore?: number;
  progress?: number;
  completionPercent: number; // 0–100
  estimatedHours: number;
  tasks?: Array<{
    id: string;
    title: string;
    description?: string;
    estimatedHours?: number;
    isCompleted: boolean;
  }>;
}

export interface Roadmap {
  durationWeeks: number; // 16
  weeklyPlan: WeeklyPlanItem[];
  overallCompletion: number; // 0–100
  generatedAt: string;
  overallProgress?: number;
  id?: string | null;
  userSummary?: string | null;
  globalNotes?: string[];
  preferences?: CourseRoadmapPreferences | null;
  youtubeVideos?: YouTubeVideoRecommendation[];
  hasPreferences?: boolean;
  roadmapType?: 'system' | 'manual';
  title?: string;
  aiGenerated?: boolean;
}

export interface CourseRoadmapPreferences {
  courseName: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timePerDay: number;
  durationValue: number;
  durationUnit: 'days' | 'weeks' | 'months';
  experienceNotes?: string;
  additionalNotes?: string;
}

export interface YouTubeVideoRecommendation {
  id: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: string;
}

export interface RoadmapPreferencesResponse {
  hasPreferences: boolean;
  preferences?: CourseRoadmapPreferences;
  summary?: string;
}

export interface ManualRoadmapPayload {
  title: string;
  courseName: string;
  currentLevel: CourseRoadmapPreferences['currentLevel'];
  timePerDay: number;
  durationValue: number;
  durationUnit: CourseRoadmapPreferences['durationUnit'];
  globalNotes: string[];
  weeklyPlan: WeeklyPlanItem[];
}

export interface SkillPoint {
  week: number;
  dsa: number;
  csFundamentals: number;
  systemDesign: number;
  language: number;
  behavioral: number;
}

export interface SkillAnalytics {
  history: SkillPoint[];
  currentLevels: {
    dsa: number;
    csFundamentals: number;
    systemDesign: number;
    language: number;
    behavioral: number;
  };
  targetLevels: {
    dsa: number;
    csFundamentals: number;
    systemDesign: number;
    language: number;
    behavioral: number;
  };
}

export interface CompanyMatch {
  company: string;
  name?: string; // Alias for company name
  role: string;
  fitScore: number; // 0–1
  estimatedSuccessProb: number; // 0–1
  successProbability?: number; // Alias for estimatedSuccessProb (percentage)
  keyGaps: string[];
  skillGaps?: string[]; // Alias for keyGaps
  packageRange: {
    min: number;
    max: number;
  };
  requiredSkills: string[];
  matchedSkills: string[];
  hiringStatus?: string; // Active, Paused, etc.
  computedAt?: string;
  reasons?: string[];
  explanation?: string;
}

export interface CompanyMatchesResponse {
  rankedCompanies: CompanyMatch[];
  totalCompanies: number;
  companies?: CompanyMatch[];
  totalMatches?: number;
  highFitCount?: number;
  maxPackage?: number;
  lastComputedAt?: string | null;
  dataFreshness?: {
    integrations: {
      github: {
        connected: boolean;
        username: string;
        lastSyncAt: string | null;
        syncStatus: string;
      } | null;
      leetcode: {
        connected: boolean;
        username: string;
        lastSyncAt: string | null;
        syncStatus: string;
      } | null;
    };
    usingExternalSignals: boolean;
  };
  message?: string;
}

export interface TopicPriority {
  topic: string;
  priorityScore: number; // 0–100
  estimatedHours: number;
  currentLevel: number;
  targetLevel: number;
  reason: string;
}

export interface MonteCarloDataPoint {
  weeks: number;
  probability: number;
}

export interface OptimizationInsights {
  expectedTimeReductionPercent: number;
  monteCarloDistribution: MonteCarloDataPoint[];
  topicPriorities: TopicPriority[];
  weeklyFocus: {
    topics: string[];
    explanation: string;
    estimatedImpact: number;
  };
}

// UI Component Props Types

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface GaugeChartProps {
  value: number; // 0-100
  label: string;
  color?: string;
  size?: number;
}

export interface LineChartSkillsProps {
  data: SkillPoint[];
  height?: number;
}

export interface RadarSkillGapChartProps {
  current: {
    dsa: number;
    csFundamentals: number;
    systemDesign: number;
    language: number;
    behavioral: number;
  };
  target: {
    dsa: number;
    csFundamentals: number;
    systemDesign: number;
    language: number;
    behavioral: number;
  };
  height?: number;
}

export interface CompanyTableProps {
  companies: CompanyMatch[];
  onViewDetails: (company: CompanyMatch) => void;
}

export interface WeekCardProps {
  week: WeeklyPlanItem;
  onUpdateProgress: (week: number, progress: number) => void;
}

export interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}
