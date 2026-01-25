import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Button,
  Typography,
  Paper,
  Skeleton,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Refresh,
  Person,
  Timeline,
  TrendingUp,
  EmojiEvents,
  School,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import KpiCard from '@/components/ui/KpiCard';
import GaugeChart from '@/components/ui/GaugeChart';
import LineChartSkills from '@/components/ui/LineChartSkills';
import { analyticsApi, profileApi } from '@/api/api';
import type { CompanyMatch } from '@/types';

export default function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  // Fetch profile first to check if it's complete
  const {
    data: profileData,
    isLoading: profileLoading,
  } = useQuery({
    queryKey: ['studentProfile'],
    queryFn: () => profileApi.getProfile(),
  });

  // Fetch data using React Query
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ['placementSummary'],
    queryFn: () => analyticsApi.getPlacementSummary(),
  });

  const {
    data: skillData,
    isLoading: skillLoading,
    error: skillError,
  } = useQuery({
    queryKey: ['skillAnalytics'],
    queryFn: () => analyticsApi.getSkillAnalytics(),
  });

  const {
    data: companyData,
    isLoading: companyLoading,
    error: companyError,
  } = useQuery({
    queryKey: ['companyMatches'],
    queryFn: () => analyticsApi.getCompanyMatches(),
  });

  const profile = profileData;
  const summary = summaryData;
  const skills = skillData;
  const companies = companyData;

  // Check if profile is incomplete
  const isProfileIncomplete = !profile?.name || !profile?.college || profile?.skills?.length === 0;
  
  if (isProfileIncomplete && !profileLoading) {
    return (
      <Box>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            maxWidth: 600,
            mx: 'auto',
            mt: 8,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <School sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Welcome! Let's Get Started
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            To generate your personalized placement insights and roadmap, please complete your profile first.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/profile')}
            sx={{ px: 4 }}
          >
            Complete Your Profile
          </Button>
        </Paper>
      </Box>
    );
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  const topCompanies = companies?.rankedCompanies.slice(0, 3) || [];

  if (summaryError || skillError || companyError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load dashboard data. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
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
                >
                  Refresh Data
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
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          >
            Refresh Data
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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
        <Grid item xs={12} sm={6} md={3}>
          {summaryLoading ? (
            <Skeleton variant="rectangular" height={150} />
          ) : (
            <KpiCard
              title="Problems Solved"
              value={summary?.totalProblemsSolved || 0}
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
                      {company.company}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: theme.palette.success.main }}
                    >
                      {(company.fitScore * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {company.role}
                  </Typography>
                  <Box sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Success Probability
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {(company.estimatedSuccessProb * 100).toFixed(0)}%
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
                      {company.keyGaps.slice(0, 2).map((gap: string, idx: number) => (
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
    </Box>
  );
}
