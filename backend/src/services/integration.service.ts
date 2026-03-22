import axios from 'axios';

export type IntegrationProvider = 'github' | 'leetcode';

export interface IntegrationSyncResult {
  provider: IntegrationProvider;
  username: string;
  stats: Record<string, any>;
  derivedSkills?: string[];
  derivedSkillAnalytics?: Array<{
    skillName: string;
    currentLevel: number;
    targetLevel: number;
    problemsSolved?: number;
    source: string;
  }>;
}

const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 15000,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'placement-prediction-engine'
  }
});

const leetCodeClient = axios.create({
  baseURL: 'https://leetcode.com',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Referer: 'https://leetcode.com',
    Origin: 'https://leetcode.com',
    'User-Agent': 'placement-prediction-engine'
  }
});

const normalizeUsername = (value: string) =>
  value
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, '')
    .replace(/^https?:\/\/(www\.)?leetcode\.com\//i, '')
    .replace(/^u\//i, '')
    .replace(/^profile\//i, '')
    .replace(/^@/, '')
    .replace(/\/+$/, '')
    .split(/[/?#]/)[0];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const normalizeIntegrationUsername = (provider: IntegrationProvider, value: string) => {
  const normalized = normalizeUsername(value);
  if (!normalized) {
    throw new Error(`A ${provider} username is required.`);
  }
  return normalized;
};

export const syncGitHubProfile = async (rawUsername: string): Promise<IntegrationSyncResult> => {
  const username = normalizeIntegrationUsername('github', rawUsername);

  const [{ data: user }, { data: repos }] = await Promise.all([
    githubClient.get(`/users/${username}`),
    githubClient.get(`/users/${username}/repos`, {
      params: { per_page: 100, sort: 'updated' }
    })
  ]);

  const publicRepos = Array.isArray(repos) ? repos : [];
  const totalStars = publicRepos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0);
  const totalForks = publicRepos.reduce((sum: number, repo: any) => sum + (repo.forks_count || 0), 0);
  const languageCounts = publicRepos.reduce((acc: Record<string, number>, repo: any) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {});

  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([language, count]) => ({ language, repositories: count }));

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const derivedSkillAnalytics = topLanguages.map(({ language, repositories }) => ({
    skillName: language,
    currentLevel: clamp(35 + repositories * 10, 35, 90),
    targetLevel: clamp(50 + repositories * 10, 50, 95),
    problemsSolved: repositories,
    source: 'github_sync'
  }));

  return {
    provider: 'github',
    username,
    stats: {
      username,
      name: user.name,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      followers: user.followers || 0,
      following: user.following || 0,
      publicRepos: user.public_repos || publicRepos.length,
      totalStars,
      totalForks,
      topLanguages,
      recentlyActiveRepos: publicRepos.filter((repo: any) => new Date(repo.updated_at) >= ninetyDaysAgo).length,
      syncedAt: new Date().toISOString()
    },
    derivedSkills: topLanguages.map(({ language }) => language),
    derivedSkillAnalytics
  };
};

const LEETCODE_PROFILE_QUERY = `
  query userPublicProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        userAvatar
        realName
        reputation
        countryName
        company
        school
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
      tagProblemCounts {
        advanced {
          tagName
          problemsSolved
        }
        intermediate {
          tagName
          problemsSolved
        }
        fundamental {
          tagName
          problemsSolved
        }
      }
    }
  }
`;

export const syncLeetCodeProfile = async (rawUsername: string): Promise<IntegrationSyncResult> => {
  const username = normalizeIntegrationUsername('leetcode', rawUsername);

  const { data } = await leetCodeClient.post('/graphql/', {
    query: LEETCODE_PROFILE_QUERY,
    variables: { username }
  });

  const matchedUser = data?.data?.matchedUser;
  if (!matchedUser) {
    throw new Error('LeetCode user not found or profile is not publicly accessible.');
  }

  const solvedCounts = (matchedUser.submitStatsGlobal?.acSubmissionNum || []).reduce(
    (acc: Record<string, number>, item: any) => {
      if (item?.difficulty) {
        acc[item.difficulty.toLowerCase()] = item.count || 0;
      }
      return acc;
    },
    {}
  );

  const topTags = [
    ...(matchedUser.tagProblemCounts?.advanced || []),
    ...(matchedUser.tagProblemCounts?.intermediate || []),
    ...(matchedUser.tagProblemCounts?.fundamental || [])
  ]
    .filter((tag: any) => tag?.tagName && typeof tag.problemsSolved === 'number')
    .sort((a: any, b: any) => b.problemsSolved - a.problemsSolved)
    .slice(0, 8)
    .map((tag: any) => ({
      tagName: tag.tagName,
      problemsSolved: tag.problemsSolved
    }));

  const totalSolved = solvedCounts.all ?? (
    (solvedCounts.easy || 0) + (solvedCounts.medium || 0) + (solvedCounts.hard || 0)
  );

  return {
    provider: 'leetcode',
    username,
    stats: {
      username,
      profileUrl: `https://leetcode.com/${username}/`,
      avatarUrl: matchedUser.profile?.userAvatar || null,
      ranking: matchedUser.profile?.ranking || null,
      reputation: matchedUser.profile?.reputation || 0,
      totalSolved,
      easySolved: solvedCounts.easy || 0,
      mediumSolved: solvedCounts.medium || 0,
      hardSolved: solvedCounts.hard || 0,
      topTags,
      syncedAt: new Date().toISOString()
    },
    derivedSkills: topTags.map((tag: any) => tag.tagName),
    derivedSkillAnalytics: topTags.map((tag: any) => ({
      skillName: tag.tagName,
      currentLevel: clamp(20 + tag.problemsSolved * 2, 20, 92),
      targetLevel: clamp(35 + tag.problemsSolved * 2, 35, 95),
      problemsSolved: tag.problemsSolved,
      source: 'leetcode_sync'
    }))
  };
};
