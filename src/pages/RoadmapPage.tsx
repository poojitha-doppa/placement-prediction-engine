import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from '@mui/material';
import { Refresh, Assessment } from '@mui/icons-material';
import WeekCard from '@/components/ui/WeekCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { roadmapApi, agentApi } from '@/api/api';

export default function RoadmapPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  // Fetch roadmap data
  const {
    data: roadmapData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => roadmapApi.getRoadmap(),
  });

  // Update week progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: ({ week, progress }: { week: number; progress: number }) =>
      roadmapApi.logProgress({ weekNumber: week, completionPercent: progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['placementSummary'] });
    },
  });

  // Regenerate roadmap mutation
  const regenerateMutation = useMutation({
    mutationFn: () => agentApi.generateRoadmap(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      setRegenerateDialogOpen(false);
    },
  });

  const roadmap = roadmapData;

  const handleUpdateProgress = (week: number, progress: number) => {
    updateProgressMutation.mutate({ week, progress });
  };

  const handleRegenerateRoadmap = () => {
    regenerateMutation.mutate();
  };

  // Group weeks by phase (4 weeks each)
  const getWeeksForPhase = (phase: number) => {
    if (!roadmap) return [];
    const startWeek = phase * 4 + 1;
    const endWeek = Math.min(startWeek + 3, roadmap.durationWeeks);
    return roadmap.weeklyPlan.filter(
      (w: any) => w.week >= startWeek && w.week <= endWeek
    );
  };

  const phases = [
    { label: 'Phase 1: Foundations (Weeks 1-4)', weeks: getWeeksForPhase(0) },
    { label: 'Phase 2: Advanced DSA (Weeks 5-8)', weeks: getWeeksForPhase(1) },
    { label: 'Phase 3: System Design (Weeks 9-12)', weeks: getWeeksForPhase(2) },
    { label: 'Phase 4: Interview Prep (Weeks 13-16)', weeks: getWeeksForPhase(3) },
  ];

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
        Failed to load roadmap. Please try again.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            16-Week Placement Roadmap
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your personalized learning path to placement success
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={regenerateMutation.isPending ? <CircularProgress size={16} /> : <Refresh />}
          onClick={() => setRegenerateDialogOpen(true)}
          disabled={regenerateMutation.isPending}
        >
          Regenerate Roadmap
        </Button>
      </Box>

      {/* Overall Progress */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Overall Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Assessment color="primary" />
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {roadmap?.overallCompletion || 0}%
            </Typography>
          </Box>
        </Box>
        <ProgressBar
          value={roadmap?.overallCompletion || 0}
          color={
            (roadmap?.overallCompletion || 0) >= 75
              ? 'success'
              : (roadmap?.overallCompletion || 0) >= 50
              ? 'primary'
              : 'warning'
          }
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Generated on: {roadmap?.generatedAt ? new Date(roadmap.generatedAt).toLocaleDateString() : 'N/A'}
        </Typography>
      </Paper>

      {/* Phase Tabs */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          mb: 3,
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          {phases.map((phase, index) => (
            <Tab key={index} label={phase.label} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {phases[tabValue] && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {phases[tabValue].weeks.length > 0 ? (
                phases[tabValue].weeks.map((week: any) => (
                  <WeekCard
                    key={week.week}
                    week={week}
                    onUpdateProgress={handleUpdateProgress}
                  />
                ))
              ) : (
                <Alert severity="info">No weeks available for this phase.</Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* All Weeks View (Optional) */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          All Weeks Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Complete list of all 16 weeks
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {roadmap?.weeklyPlan.map((week: any) => (
            <WeekCard
              key={week.week}
              week={week}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </Box>
      </Paper>

      {/* Regenerate Confirmation Dialog */}
      <Dialog
        open={regenerateDialogOpen}
        onClose={() => setRegenerateDialogOpen(false)}
      >
        <DialogTitle>Regenerate Roadmap?</DialogTitle>
        <DialogContent>
          <Typography>
            This will create a new personalized roadmap based on your current
            profile and progress. Your current roadmap and progress will be
            archived. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRegenerateRoadmap}
            variant="contained"
            disabled={regenerateMutation.isPending}
          >
            {regenerateMutation.isPending ? 'Generating...' : 'Regenerate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
