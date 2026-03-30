import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  Paper,
  Skeleton,
  Alert,
  useTheme,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Refresh,
  Person,
  Timeline,
  TrendingUp,
  EmojiEvents,
  School,
  Logout,
  CheckCircle,
  WarningAmber,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import KpiCard from '@/components/ui/KpiCard';
import GaugeChart from '@/components/ui/GaugeChart';
import LineChartSkills from '@/components/ui/LineChartSkills';
import { analyticsApi, profileApi } from '@/api/api';
import type { CompanyMatch } from '@/types';

export default function DashboardPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [refreshMessage, setRefreshMessage] = React.useState('');
  // Fetch profile first to check if it's complete
  const {
    data: profileData,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => profileApi.getProfile(),
    refetchInterval: 60000,
  });

  // Fetch data using React Query
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ['placementSummary'],
    queryFn: () => analyticsApi.getPlacementSummary(),
    refetchInterval: 60000,
  });

  const {
    data: skillData,
    isLoading: skillLoading,
    error: skillError,
  } = useQuery({
    queryKey: ['skillAnalytics'],
    queryFn: () => analyticsApi.getSkillAnalytics(),
    refetchInterval: 60000,
  });

  const {
    data: companyData,
    isLoading: companyLoading,
    error: companyError,
  } = useQuery({
    queryKey: ['companyMatches'],
    queryFn: () => analyticsApi.getCompanyMatches(),
    refetchInterval: 60000,
  });

  const {
    data: mlHealth,
  } = useQuery({
    queryKey: ['mlHealth'],
    queryFn: () => analyticsApi.getMLHealth(),
    refetchInterval: 15000,
  });

  const {
    data: mlData,
    isLoading: mlLoading,
    error: mlQueryError,
  } = useQuery({
    queryKey: ['mlAnalytics'],
    queryFn: () => analyticsApi.getAnalytics(),
    retry: false,
    refetchInterval: 60000,
  });

  const mlError = mlQueryError ? String((mlQueryError as any)?.message || 'Failed to fetch ML analytics') : null;
  const profile = profileData;
  const summary = summaryData;
  const skills = skillData;
  const companies = companyData;
  const problemsSolvedCount = profile?.leetcodeSolved ?? summary?.totalProblemsSolved ?? 0;

  // Show dashboard with data - no longer blocking on incomplete profile
  // The profile is pre-populated with demo data

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const result = await analyticsApi.recomputeCompanyMatches();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['studentProfile'] }),
        queryClient.invalidateQueries({ queryKey: ['placementSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['skillAnalytics'] }),
        queryClient.invalidateQueries({ queryKey: ['companyMatches'] }),
        queryClient.invalidateQueries({ queryKey: ['mlAnalytics'] }),
        queryClient.invalidateQueries({ queryKey: ['mlHealth'] }),
      ]);
      return result;
    },
    onSuccess: (data) => {
      setRefreshMessage(data?.message || 'Dashboard data refreshed.');
    },
    onError: (mutationError: any) => {
      setRefreshMessage(mutationError.response?.data?.message || mutationError.message || 'Failed to refresh dashboard data.');
    }
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportDashboardPdf = async () => {
    const { exportDashboardToPdf } = await import('@/utils/pdfExport');
    await exportDashboardToPdf();
  };

  const handleExportFullReport = async () => {
    const { exportComprehensiveReport } = await import('@/utils/pdfExport');
    await exportComprehensiveReport({
      dashboard: document.getElementById('dashboard-content') || undefined,
      roadmap: document.getElementById('roadmap-content') || undefined,
      analytics: document.getElementById('analytics-content') || undefined,
    });
  };

  const topCompanies = (companies?.rankedCompanies || []).slice(0, 3);
  const companyCount = companies?.rankedCompanies?.length || 0;

  // Show loading state if any critical data is still loading
  if (profileLoading || summaryLoading || skillLoading || companyLoading || mlLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>Loading Dashboard...</Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={150} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (summaryError || skillError || companyError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load dashboard data. Please try again.
      </Alert>
    );
  }

  return (
    <Box id="dashboard-content">
      {/* Header with gradient background */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 4,
          mb: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                Welcome Back! 👋
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, mb: 2 }}>
                Here's your placement preparation progress
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                  startIcon={<Person />}
                  onClick={() => navigate('/profile')}
                >
                  Update Profile
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  startIcon={<Refresh />}
                  onClick={handleRefresh}
                  disabled={refreshMutation.isPending}
                >
                  {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                  startIcon={<Logout />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                gap: 1,
              }}
            >
              <EmojiEvents sx={{ fontSize: 48, opacity: 0.9 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Rest of dashboard content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your personalized placement preparation insights
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
            <Chip
              size="small"
              color={summary?.dataFreshness?.usingExternalSignals ? 'success' : 'default'}
              label={summary?.dataFreshness?.usingExternalSignals ? 'External sync data active' : 'Profile-only data'}
            />
            {summary?.dataFreshness?.integrations?.github?.lastSyncAt && (
              <Chip
                size="small"
                variant="outlined"
                label={`GitHub ${new Date(summary.dataFreshness.integrations.github.lastSyncAt).toLocaleDateString()}`}
              />
            )}
            {summary?.dataFreshness?.integrations?.leetcode?.lastSyncAt && (
              <Chip
                size="small"
                variant="outlined"
                label={`LeetCode ${new Date(summary.dataFreshness.integrations.leetcode.lastSyncAt).toLocaleDateString()}`}
              />
            )}
            {summary?.dataFreshness?.companyMatchesLastComputedAt && (
              <Chip
                size="small"
                variant="outlined"
                label={`Matches ${new Date(summary.dataFreshness.companyMatchesLastComputedAt).toLocaleDateString()}`}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleExportFullReport}
          >
            Export Full Report
          </Button>
          <Button
            variant="outlined"
            onClick={handleExportDashboardPdf}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Person />}
            onClick={() => navigate('/profile')}
          >
            Update Profile
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* ML Placement Probability */}
        <Grid item xs={12} sm={6} md={3}>
          {mlLoading ? (
            <Skeleton variant="rectangular" height={150} />
          ) : mlError ? (
            <Alert severity="warning" sx={{ height: 150 }}>
              ML service unavailable
            </Alert>
          ) : (
            <KpiCard
              title="ML Placement Probability"
              value={`${((mlData?.probability || 0) * 100).toFixed(0)}%`}
              subtitle="Based on ML model"
              trend={{ value: mlData?.probability > 0.7 ? 15 : 5, direction: 'up' }}
              icon={<TrendingUp />}
              color="success"
            />
          )}
        </Grid>

        {/* Risk Level Badge */}
        <Grid item xs={12} sm={6} md={3}>
          {mlLoading ? (
            <Skeleton variant="rectangular" height={150} />
          ) : mlError ? (
            <Skeleton variant="rectangular" height={150} />
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                height: 150,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Risk Level
              </Typography>
              <Chip
                label={mlData?.risk_level?.toUpperCase() || 'UNKNOWN'}
                icon={
                  mlData?.risk_level === 'high'
                    ? <ErrorIcon />
                    : mlData?.risk_level === 'medium'
                    ? <WarningAmber />
                    : <CheckCircle />
                }
                color={
                  mlData?.risk_level === 'high'
                    ? 'error'
                    : mlData?.risk_level === 'medium'
                    ? 'warning'
                    : 'success'
                }
                size="medium"
                sx={{ minWidth: 120, height: 36, fontSize: 12 }}
              />
              <Typography variant="caption" color="text.secondary">
                Mean Prob: {((mlData?.mean_probability || 0) * 100).toFixed(1)}%
              </Typography>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {summaryLoading ? (
            <Skeleton variant="rectangular" height={150} />
          ) : (
            <KpiCard
              title="Overall Placement Probability"
              value={`${((summary?.overallPlacementProb || 0) * 100).toFixed(0)}%`}
              subtitle="Based on current skills"
              trend={{ value: 8, direction: 'up' }}
              icon={<TrendingUp />}
              color="success"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {summaryLoading ? (
            <Skeleton variant="rectangular" height={150} />
          ) : (
            <KpiCard
              title="20+ LPA Probability"
              value={`${((summary?.highPackageProb20LpaPlus || 0) * 100).toFixed(0)}%`}
              subtitle="High package potential"
              trend={{ value: 12, direction: 'up' }}
              icon={<EmojiEvents />}
              color="warning"
            />
          )}
        </Grid>
      </Grid>

      {mlHealth && !mlHealth.running && (
        <Alert severity="info" sx={{ mb: 4 }}>
          {mlHealth.message}
        </Alert>
      )}

      {/* ML Simulation Results */}
      {!mlError && mlData?.simulations && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: `1px solid ${theme.palette.divider}`,
            mb: 4,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(103, 58, 183, 0.1)' : 'rgba(103, 58, 183, 0.05)',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Monte Carlo Simulation Results
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Simulations
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {mlData?.simulations?.length || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Mean Probability
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {((mlData?.mean_probability || 0) * 100).toFixed(2)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Variance
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {(mlData?.variance || 0).toFixed(6)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Risk Assessment
                </Typography>
                <Chip
                  label={mlData?.risk_level?.toUpperCase() || 'CALCULATING'}
                  color={
                    mlData?.risk_level === 'high'
                      ? 'error'
                      : mlData?.risk_level === 'medium'
                      ? 'warning'
                      : 'success'
                  }
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Rest of KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {summaryLoading ? (
            <Skeleton variant="rectangular" height={150} />
          ) : (
            <KpiCard
              title="Problems Solved"
              value={problemsSolvedCount}
              subtitle="Total count"
              trend={{ value: 5, direction: 'up' }}
              icon={<Timeline />}
              color="primary"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {summaryLoading ? (
            <Skeleton variant="rectangular" height={150} />
          ) : (
            <KpiCard
              title="Current Streak"
              value={`${summary?.currentStreak || 0} days`}
              subtitle="Keep it going!"
              trend={{ value: 3, direction: 'up' }}
              icon={<TrendingUp />}
              color="info"
            />
          )}
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Placement Probability Gauge */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Placement Readiness
            </Typography>
            {summaryLoading ? (
              <Skeleton variant="circular" width={200} height={200} />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mt: 3,
                }}
              >
                <GaugeChart
                  value={Math.round((summary?.overallPlacementProb || 0) * 100)}
                  label="Overall Readiness"
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Skill Progression Chart */}
        <Grid item xs={12} md={8}>
          {skillLoading ? (
            <Skeleton variant="rectangular" height={400} />
          ) : (
            <LineChartSkills data={skills?.history || []} height={320} />
          )}
        </Grid>
      </Grid>

      {/* Top Companies Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Top Target Companies
          </Typography>
          <Button
            variant="text"
            onClick={() => navigate('/companies')}
            size="small"
          >
            View All
          </Button>
        </Box>

        {companyLoading ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={200} sx={{ flex: 1 }} />
            ))}
          </Box>
        ) : (
          <Grid container spacing={3}>
            {topCompanies.map((company: any, index: number) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    border: `2px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {company.name || company.company || 'Company'}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: theme.palette.success.main }}
                    >
                      {company.fitScore ? (company.fitScore >= 1 ? company.fitScore.toFixed(0) : (company.fitScore * 100).toFixed(0)) : 0}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {company.role || 'Software Engineer'}
                  </Typography>
                  <Box sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Success Probability
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {company.successProbability || company.estimatedSuccessProb 
                        ? (company.successProbability >= 1 || (company.estimatedSuccessProb && company.estimatedSuccessProb >= 1)
                          ? (company.successProbability || company.estimatedSuccessProb).toFixed(0)
                          : ((company.successProbability || company.estimatedSuccessProb) * 100).toFixed(0))
                        : 0}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                    >
                      Key Gaps:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {(company.skillGaps || company.keyGaps || []).slice(0, 2).map((gap: string, idx: number) => (
                        <Typography
                          key={idx}
                          variant="caption"
                          sx={{
                            px: 1,
                            py: 0.5,
                            bgcolor: theme.palette.error.light,
                            color: theme.palette.error.dark,
                            borderRadius: 1,
                          }}
                        >
                          {gap}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
            {companyCount === 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Add target companies in your profile to get personalized company recommendations.
                </Alert>
              </Grid>
            )}
          </Grid>
        )}
      </Paper>

      {/* Quick Actions */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/roadmap')}
        >
          View Full Roadmap
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/analytics')}
        >
          Detailed Analytics
        </Button>
      </Box>

      <Snackbar
        open={Boolean(refreshMessage)}
        autoHideDuration={4000}
        onClose={() => setRefreshMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={refreshMessage.toLowerCase().includes('failed') ? 'error' : 'success'}
          onClose={() => setRefreshMessage('')}
        >
          {refreshMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
