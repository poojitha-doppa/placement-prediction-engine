import {
  StudentProfile,
  PlacementSummary,
  Roadmap,
  SkillAnalytics,
  CompanyMatchesResponse,
  OptimizationInsights,
  ApiResponse,
} from '@/types';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to get profile from localStorage or return default
const getStoredProfile = (): StudentProfile => {
  const stored = localStorage.getItem('studentProfile');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    id: 'student-001',
    name: '',
    college: '',
    branch: '',
    graduationYear: new Date().getFullYear() + 1,
    cgpa: 0,
    skills: [],
    leetcodeSolved: 0,
    githubUrl: '',
    leetcodeUrl: '',
    resumeUrl: '',
    email: '',
    targets: {
      companies: [],
      roles: [],
      minPackageLPA: 0,
    },
    integrationStatus: {
      github: 'not-connected',
      leetcode: 'not-connected',
      resume: 'not-uploaded',
    },
  };
};

// Mock data
export const mockStudentProfile: StudentProfile = getStoredProfile();

export const mockPlacementSummary: PlacementSummary = {
  overallPlacementProb: 0,
  highPackageProb20LpaPlus: 0,
  companyProbs: {},
  totalProblemsSolved: 0,
  currentStreak: 0,
  lastUpdated: new Date().toISOString(),
};

export const mockSkillAnalytics: SkillAnalytics = {
  history: [
    { week: 0, dsa: 45, csFundamentals: 50, systemDesign: 20, language: 60, behavioral: 40 },
    { week: 2, dsa: 52, csFundamentals: 55, systemDesign: 25, language: 65, behavioral: 45 },
    { week: 4, dsa: 60, csFundamentals: 62, systemDesign: 32, language: 70, behavioral: 52 },
    { week: 6, dsa: 68, csFundamentals: 68, systemDesign: 40, language: 75, behavioral: 58 },
    { week: 8, dsa: 75, csFundamentals: 74, systemDesign: 50, language: 80, behavioral: 65 },
    { week: 10, dsa: 82, csFundamentals: 80, systemDesign: 60, language: 85, behavioral: 72 },
  ],
  currentLevels: {
    dsa: 82,
    csFundamentals: 80,
    systemDesign: 60,
    language: 85,
    behavioral: 72,
  },
  targetLevels: {
    dsa: 95,
    csFundamentals: 92,
    systemDesign: 88,
    language: 90,
    behavioral: 85,
  },
};

export const mockRoadmap: Roadmap = {
  durationWeeks: 16,
  overallCompletion: 45,
  generatedAt: '2025-12-15T08:00:00Z',
  weeklyPlan: [
    {
      week: 1,
      focusAreas: ['Arrays', 'Strings'],
      targets: [
        'Solve 15 easy array problems',
        'Master two-pointer technique',
        'Complete string manipulation problems',
      ],
      expectedOutcomes: [
        'Strong foundation in basic data structures',
        'Ability to solve medium array problems',
      ],
      completionPercent: 100,
      estimatedHours: 20,
    },
    {
      week: 2,
      focusAreas: ['Linked Lists', 'Stacks & Queues'],
      targets: [
        'Implement linked list from scratch',
        'Solve 10 linked list problems',
        'Master stack/queue operations',
      ],
      expectedOutcomes: [
        'Understand pointer manipulation',
        'Solve medium linked list problems',
      ],
      completionPercent: 85,
      estimatedHours: 22,
    },
    {
      week: 3,
      focusAreas: ['Trees', 'Binary Search Trees'],
      targets: [
        'Implement tree traversals (inorder, preorder, postorder)',
        'Solve 12 tree problems',
        'Master BST operations',
      ],
      expectedOutcomes: [
        'Strong understanding of tree data structures',
        'Ability to solve tree-based problems',
      ],
      completionPercent: 60,
      estimatedHours: 24,
    },
    {
      week: 4,
      focusAreas: ['Recursion', 'Backtracking'],
      targets: [
        'Solve 10 recursion problems',
        'Implement backtracking algorithms',
        'Practice subset and permutation problems',
      ],
      expectedOutcomes: [
        'Master recursive problem-solving',
        'Understand backtracking patterns',
      ],
      completionPercent: 40,
      estimatedHours: 26,
    },
    {
      week: 5,
      focusAreas: ['Dynamic Programming - Basics'],
      targets: [
        'Understand memoization and tabulation',
        'Solve classic DP problems (Fibonacci, climbing stairs)',
        'Practice 10 1D DP problems',
      ],
      expectedOutcomes: [
        'Foundation in dynamic programming',
        'Identify DP problem patterns',
      ],
      completionPercent: 25,
      estimatedHours: 28,
    },
    {
      week: 6,
      focusAreas: ['Dynamic Programming - Advanced'],
      targets: [
        'Master 2D DP problems',
        'Solve knapsack variants',
        'Practice LCS and edit distance',
      ],
      expectedOutcomes: [
        'Advanced DP problem-solving',
        'Optimize space complexity',
      ],
      completionPercent: 10,
      estimatedHours: 30,
    },
    {
      week: 7,
      focusAreas: ['Graphs - Basics', 'BFS/DFS'],
      targets: [
        'Implement graph representations',
        'Master BFS and DFS traversals',
        'Solve 10 graph traversal problems',
      ],
      expectedOutcomes: [
        'Strong graph fundamentals',
        'Solve medium graph problems',
      ],
      completionPercent: 0,
      estimatedHours: 26,
    },
    {
      week: 8,
      focusAreas: ['Graphs - Advanced'],
      targets: [
        'Learn shortest path algorithms (Dijkstra, Bellman-Ford)',
        'Practice topological sorting',
        'Solve 8 advanced graph problems',
      ],
      expectedOutcomes: [
        'Master graph algorithms',
        'Handle complex graph scenarios',
      ],
      completionPercent: 0,
      estimatedHours: 28,
    },
    {
      week: 9,
      focusAreas: ['System Design - Basics'],
      targets: [
        'Learn system design fundamentals',
        'Understand scalability concepts',
        'Design URL shortener and parking lot',
      ],
      expectedOutcomes: [
        'Foundation in system design',
        'Ability to design simple systems',
      ],
      completionPercent: 0,
      estimatedHours: 20,
    },
    {
      week: 10,
      focusAreas: ['System Design - Databases & Caching'],
      targets: [
        'Study database design patterns',
        'Learn caching strategies',
        'Design Instagram-like feed system',
      ],
      expectedOutcomes: [
        'Understand database scaling',
        'Master caching techniques',
      ],
      completionPercent: 0,
      estimatedHours: 22,
    },
    {
      week: 11,
      focusAreas: ['System Design - Distributed Systems'],
      targets: [
        'Learn CAP theorem and consistency models',
        'Study load balancing and sharding',
        'Design distributed cache',
      ],
      expectedOutcomes: [
        'Understand distributed systems',
        'Design scalable architectures',
      ],
      completionPercent: 0,
      estimatedHours: 24,
    },
    {
      week: 12,
      focusAreas: ['OS Concepts', 'Networking'],
      targets: [
        'Study processes, threads, and concurrency',
        'Learn TCP/IP, HTTP protocols',
        'Practice OS interview questions',
      ],
      expectedOutcomes: [
        'Strong CS fundamentals',
        'Handle technical interview questions',
      ],
      completionPercent: 0,
      estimatedHours: 20,
    },
    {
      week: 13,
      focusAreas: ['Behavioral Interview Prep'],
      targets: [
        'Prepare STAR format stories',
        'Practice leadership principles',
        'Mock behavioral interviews',
      ],
      expectedOutcomes: [
        'Confident in behavioral rounds',
        'Clear communication skills',
      ],
      completionPercent: 0,
      estimatedHours: 15,
    },
    {
      week: 14,
      focusAreas: ['Mock Interviews - Round 1'],
      targets: [
        'Complete 5 coding mock interviews',
        'Practice under time constraints',
        'Get feedback and improve',
      ],
      expectedOutcomes: [
        'Interview readiness',
        'Time management skills',
      ],
      completionPercent: 0,
      estimatedHours: 25,
    },
    {
      week: 15,
      focusAreas: ['Mock Interviews - Round 2', 'Resume Building'],
      targets: [
        'Complete 3 system design mocks',
        'Refine resume with projects',
        'Prepare company-specific questions',
      ],
      expectedOutcomes: [
        'Polished resume',
        'Company-specific preparation',
      ],
      completionPercent: 0,
      estimatedHours: 20,
    },
    {
      week: 16,
      focusAreas: ['Final Revision', 'Confidence Building'],
      targets: [
        'Revise all key concepts',
        'Solve mixed problem sets',
        'Mental preparation and rest',
      ],
      expectedOutcomes: [
        'Complete interview readiness',
        'Confident mindset',
      ],
      completionPercent: 0,
      estimatedHours: 18,
    },
  ],
};

export const mockCompanyMatches: CompanyMatchesResponse = {
  totalCompanies: 8,
  rankedCompanies: [
    {
      company: 'Amazon',
      role: 'Software Development Engineer',
      fitScore: 0.85,
      estimatedSuccessProb: 0.82,
      keyGaps: ['System Design', 'Leadership Principles'],
      packageRange: { min: 42, max: 58 },
      requiredSkills: ['DSA', 'Java/Python', 'System Design', 'OOP'],
      matchedSkills: ['DSA', 'Python', 'OOP'],
    },
    {
      company: 'Microsoft',
      role: 'Software Engineer',
      fitScore: 0.78,
      estimatedSuccessProb: 0.75,
      keyGaps: ['Azure Knowledge', 'C#'],
      packageRange: { min: 38, max: 52 },
      requiredSkills: ['DSA', 'System Design', 'C#/.NET', 'Cloud'],
      matchedSkills: ['DSA', 'System Design'],
    },
    {
      company: 'Google',
      role: 'Software Engineer',
      fitScore: 0.72,
      estimatedSuccessProb: 0.68,
      keyGaps: ['Advanced Algorithms', 'Distributed Systems'],
      packageRange: { min: 45, max: 65 },
      requiredSkills: ['Advanced DSA', 'System Design', 'C++/Java', 'Algorithms'],
      matchedSkills: ['DSA', 'System Design'],
    },
    {
      company: 'Meta',
      role: 'Software Engineer',
      fitScore: 0.65,
      estimatedSuccessProb: 0.62,
      keyGaps: ['React Native', 'Mobile Development', 'Behavioral'],
      packageRange: { min: 40, max: 60 },
      requiredSkills: ['DSA', 'React', 'System Design', 'Mobile'],
      matchedSkills: ['DSA', 'React'],
    },
    {
      company: 'Atlassian',
      role: 'Backend Engineer',
      fitScore: 0.70,
      estimatedSuccessProb: 0.72,
      keyGaps: ['Microservices', 'Kubernetes'],
      packageRange: { min: 30, max: 45 },
      requiredSkills: ['DSA', 'Backend', 'Microservices', 'Java'],
      matchedSkills: ['DSA', 'Backend'],
    },
  ],
};

export const mockOptimizationInsights: OptimizationInsights = {
  expectedTimeReductionPercent: 22,
  monteCarloDistribution: [
    { weeks: 10, probability: 0.05 },
    { weeks: 11, probability: 0.12 },
    { weeks: 12, probability: 0.25 },
    { weeks: 13, probability: 0.28 },
    { weeks: 14, probability: 0.18 },
    { weeks: 15, probability: 0.08 },
    { weeks: 16, probability: 0.04 },
  ],
  topicPriorities: [
    {
      topic: 'Dynamic Programming',
      priorityScore: 95,
      estimatedHours: 40,
      currentLevel: 60,
      targetLevel: 90,
      reason: 'High impact for target companies, largest skill gap',
    },
    {
      topic: 'System Design - Distributed Systems',
      priorityScore: 88,
      estimatedHours: 35,
      currentLevel: 55,
      targetLevel: 85,
      reason: 'Critical for senior roles, frequently asked',
    },
    {
      topic: 'Graph Algorithms',
      priorityScore: 82,
      estimatedHours: 30,
      currentLevel: 65,
      targetLevel: 88,
      reason: 'Common in coding rounds, moderate gap',
    },
    {
      topic: 'Behavioral Interview Prep',
      priorityScore: 78,
      estimatedHours: 20,
      currentLevel: 72,
      targetLevel: 85,
      reason: 'Often overlooked, can be deal-breaker',
    },
    {
      topic: 'Advanced Data Structures',
      priorityScore: 72,
      estimatedHours: 25,
      currentLevel: 70,
      targetLevel: 90,
      reason: 'Differentiator for top-tier companies',
    },
  ],
  weeklyFocus: {
    topics: ['Dynamic Programming', 'System Design Basics'],
    explanation:
      'Focus on DP this week as it has the highest impact on your placement probability. Combine with system design basics to maintain balanced growth.',
    estimatedImpact: 0.12,
  },
};

// API Service Functions
export const api = {
  // Student Profile
  async getStudentProfile(): Promise<ApiResponse<StudentProfile>> {
    await delay(500);
    const profile = getStoredProfile();
    return {
      success: true,
      data: profile,
      timestamp: new Date().toISOString(),
    };
  },

  async updateStudentProfile(
    profile: Partial<StudentProfile>
  ): Promise<ApiResponse<StudentProfile>> {
    await delay(800);
    const currentProfile = getStoredProfile();
    const updatedProfile = { ...currentProfile, ...profile };
    localStorage.setItem('studentProfile', JSON.stringify(updatedProfile));
    Object.assign(mockStudentProfile, updatedProfile);
    return {
      success: true,
      data: updatedProfile,
      timestamp: new Date().toISOString(),
    };
  },

  // Placement Summary - Calculate based on user profile
  async getPlacementSummary(): Promise<ApiResponse<PlacementSummary>> {
    await delay(600);
    const profile = getStoredProfile();
    
    // Calculate metrics based on profile completeness and quality
    const hasBasicInfo = profile.name && profile.college && profile.cgpa > 0;
    const cgpaScore = Math.min((profile.cgpa / 10) * 100, 100);
    const skillsScore = Math.min(profile.skills.length * 8, 100);
    const leetcodeSolved = profile.leetcodeSolved || 0;
    const codingScore = Math.min((leetcodeSolved / 500) * 100, 100);
    
    // Weighted placement probability: CGPA (30%) + Skills (30%) + Coding (40%)
    const placementProb = hasBasicInfo 
      ? (cgpaScore * 0.3 + skillsScore * 0.3 + codingScore * 0.4) / 100
      : 0;
    
    // High package probability is placement prob minus 10-15%
    const highPackageProb = Math.max(placementProb - 0.12, 0);
    
    // Generate company-specific probabilities
    const companyProbs: Record<string, number> = {};
    profile.targets.companies.forEach(company => {
      // Add slight variation for each company
      const variation = (Math.random() - 0.5) * 0.1; // -5% to +5%
      companyProbs[company] = Math.max(Math.min(placementProb + variation, 1), 0.3);
    });
    
    return {
      success: true,
      data: {
        overallPlacementProb: Math.round(placementProb * 100) / 100,
        highPackageProb20LpaPlus: Math.round(highPackageProb * 100) / 100,
        companyProbs,
        totalProblemsSolved: leetcodeSolved,
        currentStreak: leetcodeSolved > 0 ? Math.min(Math.floor(leetcodeSolved / 10), 30) : 0,
        lastUpdated: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  },

  // Roadmap
  async getRoadmap(): Promise<ApiResponse<Roadmap>> {
    await delay(700);
    return {
      success: true,
      data: mockRoadmap,
      timestamp: new Date().toISOString(),
    };
  },

  async updateWeekProgress(
    week: number,
    progress: number
  ): Promise<ApiResponse<Roadmap>> {
    await delay(400);
    const updatedRoadmap = {
      ...mockRoadmap,
      weeklyPlan: mockRoadmap.weeklyPlan.map((w) =>
        w.week === week ? { ...w, completionPercent: progress } : w
      ),
    };
    return {
      success: true,
      data: updatedRoadmap,
      timestamp: new Date().toISOString(),
    };
  },

  async regenerateRoadmap(): Promise<ApiResponse<Roadmap>> {
    await delay(2000);
    return {
      success: true,
      data: { ...mockRoadmap, generatedAt: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    };
  },

  // Skill Analytics
  async getSkillAnalytics(): Promise<ApiResponse<SkillAnalytics>> {
    await delay(600);
    return {
      success: true,
      data: mockSkillAnalytics,
      timestamp: new Date().toISOString(),
    };
  },

  // Company Matches - Generate based on user's target companies and skills
  async getCompanyMatches(): Promise<ApiResponse<CompanyMatchesResponse>> {
    await delay(700);
    const profile = getStoredProfile();
    
    // If no target companies, return empty
    if (!profile.targets.companies.length) {
      return {
        success: true,
        data: {
          totalCompanies: 0,
          rankedCompanies: [],
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    // Calculate base fit score from profile quality
    const cgpaFactor = profile.cgpa / 10;
    const skillsFactor = Math.min(profile.skills.length / 10, 1);
    const codingFactor = Math.min((profile.leetcodeSolved || 0) / 500, 1);
    const baseFitScore = (cgpaFactor * 0.3 + skillsFactor * 0.3 + codingFactor * 0.4);
    
    // Generate company matches
    const rankedCompanies = profile.targets.companies.map((company, index) => {
      // Add variation for each company
      const variation = (Math.random() - 0.5) * 0.15;
      const fitScore = Math.max(Math.min(baseFitScore + variation, 0.95), 0.45);
      const successProb = Math.max(fitScore - 0.05, 0.35);
      
      // Calculate package range based on company tier and minPackage
      const minPackage = Math.max(profile.targets.minPackageLPA || 15, 15);
      const packageMultiplier = 1 + (index * 0.1); // Slight variation
      
      // Match skills
      const allTechSkills = ['DSA', 'System Design', 'Java', 'Python', 'React', 'Node.js', 'C++', 'Cloud', 'Database'];
      const matchedSkills = profile.skills.filter(s => 
        allTechSkills.some(tech => s.toLowerCase().includes(tech.toLowerCase()))
      );
      
      // Identify gaps
      const keyGaps: string[] = [];
      if (!(profile.skills.some(s => s.toLowerCase().includes('system')))) {
        keyGaps.push('System Design');
      }
      if ((profile.leetcodeSolved || 0) < 200) {
        keyGaps.push('More DSA Practice');
      }
      if (!matchedSkills.length) {
        keyGaps.push('Core Technical Skills');
      }
      
      return {
        company,
        role: profile.targets.roles[0] || 'Software Engineer',
        fitScore: Math.round(fitScore * 100) / 100,
        estimatedSuccessProb: Math.round(successProb * 100) / 100,
        keyGaps,
        packageRange: {
          min: Math.round(minPackage * packageMultiplier),
          max: Math.round(minPackage * packageMultiplier * 1.4),
        },
        requiredSkills: ['DSA', 'System Design', 'Programming', ...profile.skills.slice(0, 2)],
        matchedSkills: matchedSkills.slice(0, 4),
      };
    });
    
    // Sort by fit score
    rankedCompanies.sort((a, b) => b.fitScore - a.fitScore);
    
    return {
      success: true,
      data: {
        totalCompanies: rankedCompanies.length,
        rankedCompanies,
      },
      timestamp: new Date().toISOString(),
    };
  },

  // Optimization Insights - Generate Monte Carlo simulation based on user data
  async getOptimizationInsights(): Promise<ApiResponse<OptimizationInsights>> {
    await delay(800);
    const profile = getStoredProfile();
    
    // Calculate expected time based on current skill level
    const currentLevel = (profile.cgpa / 10 * 30) + (Math.min(profile.skills.length, 10) * 5) + (Math.min((profile.leetcodeSolved || 0) / 500, 1) * 35);
    const weeksNeeded = Math.max(8, Math.round(16 - (currentLevel / 10)));
    
    // Generate Monte Carlo distribution
    const monteCarloDistribution = [];
    for (let weeks = Math.max(weeksNeeded - 3, 6); weeks <= Math.min(weeksNeeded + 4, 18); weeks++) {
      const distance = Math.abs(weeks - weeksNeeded);
      const probability = Math.exp(-Math.pow(distance, 2) / 2) / 2.5; // Normal distribution
      monteCarloDistribution.push({
        weeks,
        probability: Math.round(probability * 100) / 100,
      });
    }
    
    // Normalize probabilities
    const total = monteCarloDistribution.reduce((sum, d) => sum + d.probability, 0);
    monteCarloDistribution.forEach(d => {
      d.probability = Math.round((d.probability / total) * 100) / 100;
    });
    
    // Generate topic priorities based on skill gaps
    const hasSystemDesign = profile.skills.some(s => s.toLowerCase().includes('system'));
    const hasDSA = profile.skills.some(s => s.toLowerCase().includes('dsa') || s.toLowerCase().includes('algorithm'));
    
    const topicPriorities = [
      {
        topic: 'Data Structures & Algorithms',
        currentLevel: hasDSA ? 75 : 45,
        targetLevel: 90,
        estimatedWeeks: hasDSA ? 4 : 6,
        impact: 'High',
      },
      {
        topic: 'System Design',
        currentLevel: hasSystemDesign ? 60 : 30,
        targetLevel: 85,
        estimatedWeeks: hasSystemDesign ? 4 : 6,
        impact: 'High',
      },
      {
        topic: 'Problem Solving Speed',
        currentLevel: Math.min((profile.leetcodeSolved || 0) / 5, 80),
        targetLevel: 90,
        estimatedWeeks: 5,
        impact: 'Medium',
      },
      {
        topic: 'Behavioral Interview Prep',
        currentLevel: 50,
        targetLevel: 85,
        estimatedWeeks: 2,
        impact: 'Medium',
      },
    ];
    
    return {
      success: true,
      data: {
        expectedTimeReductionPercent: Math.round((16 - weeksNeeded) / 16 * 100),
        monteCarloDistribution,
        topicPriorities,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
