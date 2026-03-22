import { Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import {
  IntegrationProvider,
  normalizeIntegrationUsername,
  syncGitHubProfile,
  syncLeetCodeProfile
} from '../services/integration.service.js';
import { recomputeCompanyMatchesForUser } from '../services/companyMatch.service.js';

const isDatabaseAvailable = async () => {
  try {
    if (!prisma) return false;
    await prisma.$connect();
    await prisma.user.findFirst();
    return true;
  } catch {
    return false;
  }
};

const SUPPORTED_PROVIDERS: IntegrationProvider[] = ['github', 'leetcode'];

const mergeUnique = (values: Array<string | undefined | null>) =>
  Array.from(new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean)));

const getProfileFieldPatch = (provider: IntegrationProvider, username: string, stats: Record<string, any>) => {
  if (provider === 'github') {
    return { githubUsername: username };
  }

  return {
    leetcodeUsername: username,
    leetcodeSolved: stats.totalSolved || 0
  };
};

const buildSyncWarning = (provider: IntegrationProvider, stats: Record<string, any>, profile: any) => {
  if (provider === 'github') {
    const publicRepos = stats.publicRepos || 0;
    const topLanguages = Array.isArray(stats.topLanguages) ? stats.topLanguages.length : 0;
    if (publicRepos === 0 && topLanguages === 0) {
      return 'GitHub sync connected successfully, but no meaningful public repository activity was found. Existing profile skills were preserved.';
    }
    return null;
  }

  const totalSolved = stats.totalSolved || 0;
  const existingSolved = profile?.leetcodeSolved || 0;
  if (totalSolved === 0 && existingSolved > 0) {
    return 'LeetCode sync connected successfully, but no public solved-count data was returned. Your previous solved count was preserved.';
  }

  if (totalSolved === 0) {
    return 'LeetCode sync connected successfully, but the profile did not expose public solved-count data.';
  }

  return null;
};

export const getIntegrationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'External integrations require MongoDB because sync history must be persisted.'
      });
    }

    const integrations = await prisma.externalIntegration.findMany({
      where: { userId: req.user.id },
      include: {
        metrics: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.user.id }
    });

    const providers = SUPPORTED_PROVIDERS.reduce((acc, provider) => {
      const integration = integrations.find((item) => item.provider.toLowerCase() === provider);
      const latestMetric = integration?.metrics?.[0];

      acc[provider] = {
        provider,
        connected: Boolean(integration?.isConnected),
        username: integration?.username || (provider === 'github' ? profile?.githubUsername : profile?.leetcodeUsername) || null,
        lastSyncAt: integration?.lastSyncAt || null,
        syncStatus: integration?.syncStatus || 'not_connected',
        syncError: integration?.syncError || null,
        stats: latestMetric?.stats || null
      };
      return acc;
    }, {} as Record<string, any>);

    res.json({ providers });
  } catch (error: any) {
    console.error('Get integration status error:', error);
    res.status(500).json({
      error: 'Failed to fetch integration status',
      message: error.message
    });
  }
};

export const syncIntegration = async (req: AuthRequest, res: Response) => {
  const provider = String(req.body?.provider || '').toLowerCase() as IntegrationProvider;

  try {
    if (!SUPPORTED_PROVIDERS.includes(provider)) {
      return res.status(400).json({
        error: 'Unsupported provider',
        message: 'Only github and leetcode are supported.'
      });
    }

    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'External integrations require MongoDB because sync history must be persisted.'
      });
    }

    const profile = await prisma.profile.upsert({
      where: { userId: req.user.id },
      update: {},
      create: {
        userId: req.user.id,
        skills: [],
        targetCompanies: [],
        targetRoles: [],
        combinedSkills: [],
        availableHoursPerWeek: 10,
        leetcodeSolved: 0
      }
    });

    const requestedUsername = String(req.body?.username || '').trim();
    const fallbackUsername = provider === 'github' ? profile.githubUsername : profile.leetcodeUsername;
    const username = normalizeIntegrationUsername(provider, requestedUsername || fallbackUsername || '');

    await prisma.externalIntegration.upsert({
      where: {
        userId_provider: {
          userId: req.user.id,
          provider
        }
      },
      update: {
        username,
        syncStatus: 'syncing',
        syncError: null
      },
      create: {
        userId: req.user.id,
        provider,
        username,
        isConnected: false,
        syncStatus: 'syncing'
      }
    });

    const syncResult = provider === 'github'
      ? await syncGitHubProfile(username)
      : await syncLeetCodeProfile(username);

    const syncWarning = buildSyncWarning(provider, syncResult.stats, profile);
    const resolvedProfileFieldPatch = provider === 'leetcode' && (syncResult.stats.totalSolved || 0) === 0 && (profile.leetcodeSolved || 0) > 0
      ? {
          leetcodeUsername: username,
          leetcodeSolved: profile.leetcodeSolved
        }
      : getProfileFieldPatch(provider, username, syncResult.stats);

    const mergedSkills = mergeUnique([
      ...(profile.skills || []),
      ...(syncResult.derivedSkills || [])
    ]);

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user.id },
      data: {
        ...resolvedProfileFieldPatch,
        skills: mergedSkills,
        combinedSkills: mergeUnique([
          ...(profile.combinedSkills || []),
          ...mergedSkills
        ])
      }
    });

    const integration = await prisma.externalIntegration.update({
      where: {
        userId_provider: {
          userId: req.user.id,
          provider
        }
      },
      data: {
        username,
        isConnected: true,
        lastSyncAt: new Date(),
        syncStatus: 'success',
        syncError: null
      }
    });

    await prisma.externalMetric.create({
      data: {
        integrationId: integration.id,
        date: new Date(),
        stats: syncResult.stats as any
      }
    });

    if (syncResult.derivedSkillAnalytics && syncResult.derivedSkillAnalytics.length > 0) {
      await prisma.skillAnalytics.createMany({
        data: syncResult.derivedSkillAnalytics.map((item) => ({
          userId: req.user.id,
          date: new Date(),
          skillName: item.skillName,
          currentLevel: item.currentLevel,
          targetLevel: item.targetLevel,
          problemsSolved: item.problemsSolved,
          source: item.source
        }))
      });
    }

    await recomputeCompanyMatchesForUser(req.user.id, updatedProfile);

    res.json({
      message: `${provider} sync completed successfully.`,
      warning: syncWarning,
      provider,
      username,
      stats: syncResult.stats,
      profile: {
        githubUsername: updatedProfile.githubUsername,
        leetcodeUsername: updatedProfile.leetcodeUsername,
        leetcodeSolved: updatedProfile.leetcodeSolved,
        skills: updatedProfile.skills
      }
    });
  } catch (error: any) {
    console.error(`Sync ${provider} integration error:`, error);

    if (SUPPORTED_PROVIDERS.includes(provider)) {
      try {
        await prisma.externalIntegration.update({
          where: {
            userId_provider: {
              userId: req.user.id,
              provider
            }
          },
          data: {
            isConnected: false,
            syncStatus: 'error',
            syncError: error.message
          }
        });
      } catch {
        // Best-effort status update
      }
    }

    res.status(502).json({
      error: 'Integration sync failed',
      message: error.message
    });
  }
};
