import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import RadarSkillGapChart from '@/components/ui/RadarSkillGapChart';
import { analyticsApi } from '@/api/api';
import { TrendingUp, AccessTime, School } from '@mui/icons-material';

export default function AnalyticsPage() {
  const theme = useTheme();

  // Fetch analytics data
  const {
    data: skillData,
    isLoading: skillLoading,
    error: skillError,
  } = useQuery({
    queryKey: ['skillAnalytics'],
    queryFn: () => analyticsApi.getSkillAnalytics(),
  });

  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
  } = useQuery({
    queryKey: ['optimizationInsights'],
    queryFn: () => analyticsApi.getOptimizationInsights(),
  });

  const skills = skillData;
  const insights = insightsData;

  const isLoading = skillLoading || insightsLoading;
  const error = skillError || insightsError;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Failed to load analytics data. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Analytics & Optimization
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Data-driven insights to optimize your preparation strategy
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: theme.palette.success.light,
                color: theme.palette.success.dark,
                p: 2,
                borderRadius: 2,
              }}
            >
              <TrendingUp fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {insights?.expectedTimeReductionPercent || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expected Time Reduction
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.primary.dark,
                p: 2,
                borderRadius: 2,
              }}
            >
              <AccessTime fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {insights?.monteCarloDistribution.reduce(
                  (acc: any, curr: any) =>
                    acc + curr.weeks * curr.probability,
                  0
                ).toFixed(1) || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expected Weeks to Target
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                backgroundColor: theme.palette.warning.light,
                color: theme.palette.warning.dark,
                p: 2,
                borderRadius: 2,
              }}
            >
              <School fontSize="large" />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {insights?.topicPriorities.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Priority Topics Identified
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Weekly Focus Recommendation */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: `2px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.primary.light + '10',
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          🎯 Suggested Focus for This Week
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {insights?.weeklyFocus.topics.map((topic: any, idx: any) => (
            <Chip key={idx} label={topic} color="primary" />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {insights?.weeklyFocus.explanation}
        </Typography>
        <Typography variant="caption" color="primary.main" fontWeight="bold">
          Estimated Impact: +{((insights?.weeklyFocus.estimatedImpact || 0) * 100).toFixed(0)}% on placement probability
        </Typography>
      </Paper>

      {/* Skill Gap Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          {skills && (
            <RadarSkillGapChart
              current={skills.currentLevels}
              target={skills.targetLevels}
              height={350}
            />
          )}
        </Grid>

        {/* Monte Carlo Distribution */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Time to Target Skill Level
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Monte Carlo simulation (probability distribution)
              </Typography>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={insights?.monteCarloDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="weeks"
                    label={{ value: 'Weeks', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis
                    label={{ value: 'Probability', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="probability"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.main}
                    fillOpacity={0.6}
                    name="Probability"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Topic Priority Table */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Topic Priority Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ranked by impact and urgency
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Rank
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Topic
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Priority Score
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Skill Gap
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Estimated Hours
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Reason
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insights?.topicPriorities.map((topic: any, index: any) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': { backgroundColor: theme.palette.action.hover },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={`#${index + 1}`}
                      size="small"
                      color={index === 0 ? 'error' : index === 1 ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {topic.topic}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 120 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {topic.priorityScore}/100
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={topic.priorityScore}
                        color={
                          topic.priorityScore >= 85
                            ? 'error'
                            : topic.priorityScore >= 70
                            ? 'warning'
                            : 'primary'
                        }
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {topic.currentLevel} → {topic.targetLevel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Gap: {topic.targetLevel - topic.currentLevel} points
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${topic.estimatedHours}h`} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
                      {topic.reason}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
