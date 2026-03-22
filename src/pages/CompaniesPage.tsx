import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Chip,
  Divider,
  useTheme,
  Snackbar,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import CompanyTable from '@/components/ui/CompanyTable';
import { analyticsApi } from '@/api/api';
import { CompanyMatch } from '@/types';

export default function CompaniesPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState<CompanyMatch | null>(null);
  const [refreshMessage, setRefreshMessage] = useState('');

  // Helper functions to handle different property names
  const getCompanyName = (company: any) => company.name || company.company || 'Unknown';
  const getSuccessProb = (company: any) => 
    company.successProbability ?? (company.estimatedSuccessProb ? company.estimatedSuccessProb * 100 : 0);
  const getSkillGaps = (company: any) => company.skillGaps || company.keyGaps || [];

  // Fetch company matches
  const {
    data: companyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['companyMatches'],
    queryFn: () => analyticsApi.getCompanyMatches(),
    refetchInterval: 60000,
  });

  const companies = companyData;

  const recomputeMutation = useMutation({
    mutationFn: () => analyticsApi.recomputeCompanyMatches(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['companyMatches'] });
      await queryClient.invalidateQueries({ queryKey: ['placementSummary'] });
      setRefreshMessage(data?.message || 'Company matches refreshed.');
    },
    onError: (mutationError: any) => {
      setRefreshMessage(mutationError.response?.data?.message || mutationError.message || 'Failed to refresh company matches.');
    }
  });

  const handleViewDetails = (company: CompanyMatch) => {
    setSelectedCompany(company);
  };

  const handleCloseDialog = () => {
    setSelectedCompany(null);
  };

  // Prepare data for chart (top 5 companies by fit score)
  const chartData =
    companies?.companies?.slice(0, 5).map((c: any) => ({
      company: getCompanyName(c),
      fitScore: (c.fitScore * (c.fitScore <= 1 ? 100 : 1)).toFixed(0),
      successProb: getSuccessProb(c).toFixed(0),
    })) || [];

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
        Failed to load company matches. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Companies & Opportunities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Recommended companies ranked by fit score and success probability
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => recomputeMutation.mutate()}
            disabled={recomputeMutation.isPending}
          >
            {recomputeMutation.isPending ? 'Refreshing...' : 'Recompute Matches'}
          </Button>
        </Box>
        {companies?.lastComputedAt && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Last recomputed: {new Date(companies.lastComputedAt).toLocaleString()}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.5 }}>
          <Chip
            size="small"
            color={companies?.dataFreshness?.usingExternalSignals ? 'success' : 'default'}
            label={companies?.dataFreshness?.usingExternalSignals ? 'Using synced external signals' : 'Using saved profile data only'}
          />
          {companies?.dataFreshness?.integrations?.github?.lastSyncAt && (
            <Chip
              size="small"
              variant="outlined"
              label={`GitHub synced ${new Date(companies.dataFreshness.integrations.github.lastSyncAt).toLocaleString()}`}
            />
          )}
          {companies?.dataFreshness?.integrations?.leetcode?.lastSyncAt && (
            <Chip
              size="small"
              variant="outlined"
              label={`LeetCode synced ${new Date(companies.dataFreshness.integrations.leetcode.lastSyncAt).toLocaleString()}`}
            />
          )}
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" fontWeight="bold" color="primary.main">
              {companies?.totalMatches || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Matches
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" fontWeight="bold" color="success.main">
              {companies?.highFitCount || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              High Fit (70%+)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" fontWeight="bold" color="warning.main">
              {companies?.companies?.filter(
                (c: any) => {
                const score = c.fitScore * (c.fitScore <= 1 ? 100 : 1);
                return score >= 50 && score < 70;
              }
              ).length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medium Fit (50-70%)
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${theme.palette.divider}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h3" fontWeight="bold" color="text.primary">
              ₹{companies?.maxPackage || 0}L
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Max Package
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Companies Chart */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Top 5 Companies by Fit Score
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="company" type="category" width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            <Legend />
            <Bar
              dataKey="fitScore"
              fill={theme.palette.primary.main}
              name="Fit Score (%)"
              radius={[0, 8, 8, 0]}
            />
            <Bar
              dataKey="successProb"
              fill={theme.palette.success.main}
              name="Success Probability (%)"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* Companies Table */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold">
            All Company Matches
          </Typography>
        </Box>
        {(companies?.companies?.length || 0) === 0 && (
          <Box sx={{ px: 2, pb: 2 }}>
            <Alert severity="info">
              {companies?.message || 'No company matches yet. Update your profile with target companies, roles, and skills to get useful recommendations.'}
            </Alert>
          </Box>
        )}
        <CompanyTable
          companies={companies?.companies || []}
          onViewDetails={handleViewDetails}
        />
      </Paper>

      {/* Company Details Dialog */}
      <Dialog
        open={!!selectedCompany}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedCompany && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="bold">
                  {getCompanyName(selectedCompany)}
                </Typography>
                <Chip
                  label={`${(selectedCompany.fitScore * (selectedCompany.fitScore <= 1 ? 100 : 1)).toFixed(0)}% Fit`}
                  color="primary"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ py: 2 }}>
                {/* Role */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Hiring Status
                  </Typography>
                  <Typography variant="h6">{selectedCompany.hiringStatus || 'Active'}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Package Range */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Package Range
                  </Typography>
                  <Typography variant="h6">
                    ₹{selectedCompany.packageRange?.min || 0} - {selectedCompany.packageRange?.max || 0} LPA
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Success Probability */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Estimated Success Probability
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {getSuccessProb(selectedCompany).toFixed(0)}%
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Why This Match Appears
                  </Typography>
                  <Typography variant="body1">
                    {selectedCompany.explanation || 'This recommendation was generated from your persisted profile, skills, and experience data.'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    {(selectedCompany.reasons || []).map((reason, idx) => (
                      <Alert key={idx} severity="info" variant="outlined">
                        {reason}
                      </Alert>
                    ))}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Required Skills */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Required Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {selectedCompany.requiredSkills.map((skill, idx) => {
                      const isMatched = selectedCompany.matchedSkills.includes(skill);
                      return (
                        <Chip
                          key={idx}
                          label={skill}
                          color={isMatched ? 'success' : 'default'}
                          variant={isMatched ? 'filled' : 'outlined'}
                        />
                      );
                    })}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Key Gaps */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Key Skill Gaps to Address
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {getSkillGaps(selectedCompany).map((gap: string, idx: number) => (
                      <Chip
                        key={idx}
                        label={gap}
                        color="error"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {selectedCompany.computedAt && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      Match recomputed on {new Date(selectedCompany.computedAt).toLocaleString()}
                    </Typography>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button variant="contained" onClick={handleCloseDialog}>
                Add to Targets
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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
