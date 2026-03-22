import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
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
import MonteCarloChart from '@/components/MonteCarloChart';
import { analyticsApi } from '@/api/api';
import { TrendingUp, AccessTime, School, CheckCircle, WarningAmber, Error as ErrorIcon } from '@mui/icons-material';

export default function AnalyticsPage() {
  const theme = useTheme();
  const [mlData, setMlData] = React.useState<any>(null);
  const [mlLoading, setMlLoading] = React.useState(false);
  const [mlError, setMlError] = React.useState<string | null>(null);

  const { data: mlHealth } = useQuery({
    queryKey: ['mlHealth'],
    queryFn: () => analyticsApi.getMLHealth(),
    refetchInterval: 15000,
  });

  // Fetch ML Analytics
  React.useEffect(() => {
    const fetchMLAnalytics = async () => {
      setMlLoading(true);
      setMlError(null);
      try {
        const response = await analyticsApi.getAnalytics();
        setMlData(response);
      } catch (error: any) {
        console.error('Failed to fetch ML analytics:', error);
        setMlError(error.response?.data?.message || 'Failed to fetch ML analytics');
      } finally {
        setMlLoading(false);
      }
    };

    fetchMLAnalytics();
  }, []);

  // Fetch analytics data
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
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
  } = useQuery({
    queryKey: ['optimizationInsights'],
    queryFn: () => analyticsApi.getOptimizationInsights(),
    refetchInterval: 60000,
  });

  const skills = skillData;
  const insights = insightsData;

  const isLoading = skillLoading || insightsLoading || mlLoading;
  const error = skillError || insightsError;
  const getErrorMessage = (rawError: any, fallback: string) =>
    rawError?.response?.data?.message ||
    rawError?.response?.data?.error ||
    rawError?.message ||
    fallback;

  const handleExportAnalyticsPdf = async () => {
    const { exportAnalyticsToPdf } = await import('@/utils/pdfExport');
    await exportAnalyticsToPdf();
  };

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
        {getErrorMessage(error, 'Failed to load analytics data.')}
      </Alert>
    );
  }

  return (
    <Box id="analytics-content">
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Analytics & Optimization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Data-driven insights to optimize your preparation strategy
          </Typography>
        </Box>
        <Button variant="outlined" onClick={handleExportAnalyticsPdf}>
          Export PDF
        </Button>
      </Box>

      {/* ML Prediction Section */}
      {!mlError && mlData && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: theme.palette.primary.light + '15',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🤖 ML Placement Prediction
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered prediction based on {mlData?.simulations?.length || 0} Monte Carlo simulations
              </Typography>
            </Box>
            <Chip
              label={mlData?.risk_level?.toUpperCase() || 'CALCULATING'}
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
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Placement Probability
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {((mlData?.probability || 0) * 100).toFixed(2)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Mean Probability
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {((mlData?.mean_probability || 0) * 100).toFixed(2)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Variance
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {(mlData?.variance || 0).toFixed(6)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Simulations
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {mlData?.simulations?.length || 0}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Probability Gauge */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Confidence Gauge
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(mlData?.probability || 0) * 100}
              sx={{ height: 12, borderRadius: 6 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {mlData?.probability > 0.7
                ? '✅ High confidence for placement'
                : mlData?.probability > 0.5
                ? '⚠️ Moderate confidence - focus on weak areas'
                : '❌ Low confidence - intensive preparation needed'}
            </Typography>
          </Box>
        </Paper>
      )}

      {mlError && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          {mlError}. {mlHealth?.message || 'Start the Python ML API with `npm run dev:ml`.'}
        </Alert>
      )}

      {!mlError && mlHealth && (
        <Alert severity={mlHealth.running ? 'success' : 'info'} sx={{ mb: 4 }}>
          {mlHealth.running
            ? `ML service is live at ${mlHealth.serviceUrl}.`
            : mlHealth.message}
        </Alert>
      )}

      {/* Monte Carlo Simulations Chart */}
      {!mlError && mlData?.simulations && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <MonteCarloChart
            simulations={mlData.simulations}
            height={400}
            title={`Monte Carlo Simulation Results (${mlData.simulations.length} runs)`}
          />
        </Paper>
      )}

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
                {insights?.topicPriorities?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Priority Topics Identified
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Monte Carlo Risk Analysis */}
      {insights?.riskMetrics && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            border: `2px solid ${theme.palette.warning.main}`,
            backgroundColor: theme.palette.warning.light + '10',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📊 Monte Carlo Risk Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">10th Percentile (Worst Case)</Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {(insights.riskMetrics.p10 * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">Median (Expected)</Typography>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {(insights.riskMetrics.median * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">90th Percentile (Best Case)</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {(insights.riskMetrics.p90 * 100).toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary">Confidence Range</Typography>
                <Typography variant="h6" fontWeight="bold">
                  {insights.riskMetrics.confidenceRange}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>{insights.improvementStrategy?.currentStatusMessage}</strong>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

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
          {insights?.weeklyFocus?.topics?.map((topic: any, idx: any) => (
            <Chip key={idx} label={topic} color="primary" />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {insights?.weeklyFocus?.explanation}
        </Typography>
        <Typography variant="caption" color="primary.main" fontWeight="bold">
          Estimated Impact: +{((insights?.weeklyFocus?.estimatedImpact || 0) * 100).toFixed(0)}% on placement probability
        </Typography>
      </Paper>

      {/* Skill Gap Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          {skills && (
            <RadarSkillGapChart
              current={skills?.currentLevels || []}
              target={skills?.targetLevels || []}
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
                    Impact
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="bold">
                    Reasoning
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
              {insights?.topicPriorities?.map((topic: any, index: any) => (
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
                          {Math.round((topic.priority || topic.priorityScore || 0) * 100)}/100
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(topic.priority || topic.priorityScore || 0) * 100}
                        color={
                          (topic.priority || topic.priorityScore || 0) >= 0.85
                            ? 'error'
                            : (topic.priority || topic.priorityScore || 0) >= 0.70
                            ? 'warning'
                            : 'primary'
                        }
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight={500}>
                      +{Math.round(topic.estimatedImpact || 0)}% impact
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expected improvement
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {topic.reason || topic.reasoning || 'High priority topic'}
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
