import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Logout,
  People,
  TrendingUp,
  BarChart,
  Business,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../api/adminApi';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'placement-ready' | 'at-risk'>('all');
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [addCompanyDialogOpen, setAddCompanyDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanySkills, setNewCompanySkills] = useState('');

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', searchQuery, filterStatus],
    queryFn: () => adminApi.getAllUsers(searchQuery, filterStatus),
    refetchInterval: 60000,
  });

  // Fetch predictions
  const { data: predictionsData, isLoading: predictionsLoading } = useQuery({
    queryKey: ['adminPredictions'],
    queryFn: () => adminApi.getPredictions(),
    refetchInterval: 60000,
  });

  // Fetch roadmaps
  const { data: roadmapsData, isLoading: roadmapsLoading } = useQuery({
    queryKey: ['adminRoadmaps'],
    queryFn: () => adminApi.getRoadmapTracking(),
    refetchInterval: 60000,
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => adminApi.getAnalytics(),
    refetchInterval: 60000,
  });

  // Fetch companies
  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['adminCompanies'],
    queryFn: () => adminApi.getCompanies(),
    refetchInterval: 60000,
  });

  // Get user details mutation
  const userDetailsMutation = useMutation({
    mutationFn: (userId: string) => adminApi.getUserDetails(userId),
    onSuccess: (data) => {
      setSelectedUserDetails(data);
      setDetailsDialogOpen(true);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setDetailsDialogOpen(false);
    },
  });

  // Add company mutation
  const addCompanyMutation = useMutation({
    mutationFn: () =>
      adminApi.addCompany(newCompanyName, newCompanySkills.split(',').map((s) => s.trim()), 0.6),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCompanies'] });
      setNewCompanyName('');
      setNewCompanySkills('');
      setAddCompanyDialogOpen(false);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPredictionStatusColor = (status: string) => {
    if (status === 'placement-ready') return 'success';
    if (status === 'at-risk') return 'error';
    return 'warning';
  };

  return (
    <Box sx={{ p: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Admin Header */}
      <Box sx={{ mb: 4, color: 'white' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Welcome, {user?.name}! Manage all platform data and users.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Paper elevation={3} sx={{ backgroundColor: 'white', borderRadius: 2 }}>
        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.paper',
          }}
        >
          <Tab icon={<People />} iconPosition="start" label="Users" />
          <Tab icon={<TrendingUp />} iconPosition="start" label="Predictions" />
          <Tab icon={<BarChart />} iconPosition="start" label="Roadmaps" />
          <Tab icon={<BarChart />} iconPosition="start" label="Analytics" />
          <Tab icon={<Business />} iconPosition="start" label="Companies" />
        </Tabs>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {/* Users Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
              />
              <TextField
                select
                label="Filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                variant="outlined"
                size="small"
                SelectProps={{
                  native: true,
                }}
                sx={{ width: 150 }}
              >
                <option value="all">All</option>
                <option value="placement-ready">Placement Ready</option>
                <option value="at-risk">At Risk</option>
              </TextField>
            </Box>

            {usersLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>College</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Skills</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Profile Score</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Prediction</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(usersData?.users || []).map((user: any) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.college || '-'}</TableCell>
                        <TableCell>
                          {user.skills.slice(0, 2).map((skill: string) => (
                            <Chip key={skill} label={skill} size="small" sx={{ mr: 0.5 }} />
                          ))}
                          {user.skills.length > 2 && <Chip label={`+${user.skills.length - 2}`} size="small" />}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${user.profileScore}%`}
                            color={user.profileScore >= 70 ? 'success' : user.profileScore >= 50 ? 'warning' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.predictedStatus}
                            color={getPredictionStatusColor(user.predictedStatus) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            onClick={() => userDetailsMutation.mutate(user.id)}
                            disabled={userDetailsMutation.isPending}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Predictions Tab */}
          <TabPanel value={tabValue} index={1}>
            {predictionsLoading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Probability</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Predicted Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actual Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(predictionsData?.predictions || []).map((pred: any) => (
                      <TableRow key={pred.userId} hover>
                        <TableCell>{pred.name}</TableCell>
                        <TableCell>{pred.email}</TableCell>
                        <TableCell>{(pred.placementProbability * 100).toFixed(0)}%</TableCell>
                        <TableCell>
                          <Chip
                            label={pred.predictedStatus}
                            color={getPredictionStatusColor(pred.predictedStatus) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{pred.actualStatus || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Roadmaps Tab */}
          <TabPanel value={tabValue} index={2}>
            {roadmapsLoading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Completed Tasks</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Pending Tasks</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Completion %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(roadmapsData?.roadmaps || []).map((roadmap: any) => (
                      <TableRow key={roadmap.userId} hover>
                        <TableCell>{roadmap.name}</TableCell>
                        <TableCell>{roadmap.email}</TableCell>
                        <TableCell>{roadmap.completedTasks}</TableCell>
                        <TableCell>{roadmap.pendingTasks}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${roadmap.completionPercentage}%`}
                            color={roadmap.completionPercentage >= 70 ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={3}>
            {analyticsLoading ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={100} />
                ))}
              </Box>
            ) : (
              <>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Total Users
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {analyticsData?.totalUsers || 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Average Profile Score
                        </Typography>
                        <Typography variant="h4" fontWeight="bold">
                          {analyticsData?.averageProfileScore || 0}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card>
                      <CardContent>
                        <Typography color="textSecondary" gutterBottom>
                          Placement Ready
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: 'success.main' }}>
                          {analyticsData?.placedPredictionPercentage || 0}%
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Typography variant="h6" fontWeight="bold" sx={{ mt: 3, mb: 2 }}>
                  Common Skill Gaps
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                        <TableCell sx={{ fontWeight: 700 }}>Skill</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Frequency</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(analyticsData?.commonSkillGaps || []).map((gap: any) => (
                        <TableRow key={gap.skill} hover>
                          <TableCell>{gap.skill}</TableCell>
                          <TableCell>{gap.count} students</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </TabPanel>

          {/* Companies Tab */}
          <TabPanel value={tabValue} index={4}>
            <Box sx={{ mb: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAddCompanyDialogOpen(true)}
              >
                Add Company
              </Button>
            </Box>

            {companiesLoading ? (
              <Skeleton variant="rectangular" height={400} />
            ) : (
              <>
                {(companiesData?.companies || []).map((company: any, idx: number) => (
                  <Card key={idx} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {company.companyName}
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="textSecondary">
                            Eligible Students
                          </Typography>
                          <Typography variant="h6">{company.totalCandidates}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="textSecondary">
                            Avg Prediction Score
                          </Typography>
                          <Typography variant="h6">
                            {(company.averagePredictionScore * 100).toFixed(0)}%
                          </Typography>
                        </Grid>
                      </Grid>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                        Required Skills:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {company.requiredSkills.slice(0, 5).map((skill: string) => (
                          <Chip key={skill} label={skill} size="small" />
                        ))}
                        {company.requiredSkills.length > 5 && (
                          <Chip label={`+${company.requiredSkills.length - 5}`} size="small" />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabPanel>
        </Box>
      </Paper>

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUserDetails && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Name
                  </Typography>
                  <Typography variant="body1">{selectedUserDetails.user.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedUserDetails.user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Placement Probability
                  </Typography>
                  <Typography variant="body1">
                    {(selectedUserDetails.prediction.placementProbability * 100).toFixed(0)}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip label={selectedUserDetails.prediction.status} size="small" />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (selectedUserDetails) {
                deleteUserMutation.mutate(selectedUserDetails.user.id);
              }
            }}
            disabled={deleteUserMutation.isPending}
          >
            Delete User
          </Button>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Company Dialog */}
      <Dialog open={addCompanyDialogOpen} onClose={() => setAddCompanyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Company</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Company Name"
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Required Skills (comma-separated)"
              value={newCompanySkills}
              onChange={(e) => setNewCompanySkills(e.target.value)}
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddCompanyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => addCompanyMutation.mutate()}
            disabled={!newCompanyName || addCompanyMutation.isPending}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
