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
  Chip,
  Divider,
} from '@mui/material';
import { Refresh, Assessment, CheckCircle } from '@mui/icons-material';
import WeekCard from '@/components/ui/WeekCard';
import ProgressBar from '@/components/ui/ProgressBar';
import RoadmapQuestionnaire from '@/components/RoadmapQuestionnaire';
import { roadmapApi, agentApi } from '@/api/api';

export default function RoadmapPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState<boolean | null>(null);
  const [userSummary, setUserSummary] = useState<string | null>(null);

  // Fetch preferences first
  const {
    data: preferencesData,
    isLoading: preferencesLoading,
  } = useQuery({
    queryKey: ['roadmapPreferences'],
    queryFn: () => roadmapApi.getPreferences().catch(() => ({ hasPreferences: false })),
  });

  // Fetch roadmap data
  const {
    data: roadmapData,
    isLoading: roadmapLoading,
    error,
  } = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => roadmapApi.getRoadmap(),
    enabled: preferencesData?.hasPreferences === true || showQuestionnaire === false,
  });

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: (preferences: any) => roadmapApi.savePreferences(preferences),
    onSuccess: (response) => {
      console.log('Preferences saved:', response);
      setUserSummary(response.summary);
      setShowQuestionnaire(false);
      queryClient.invalidateQueries({ queryKey: ['roadmapPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
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

  const handleQuestionnaireComplete = (data: any) => {
    console.log('Questionnaire completed:', data);
    savePreferencesMutation.mutate(data);
  };

  const handleSkipQuestionnaire = () => {
    setShowQuestionnaire(false);
  };

  const isLoading = preferencesLoading || roadmapLoading;

  // Show questionnaire if no preferences exist and user hasn't skipped
  if (preferencesData?.hasPreferences === false && showQuestionnaire !== false) {
    if (preferencesLoading) {
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

    return (
      <Box>
        <RoadmapQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onSkip={handleSkipQuestionnaire}
        />
        {savePreferencesMutation.isPending && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Generating your personalized roadmap...</Typography>
          </Box>
        )}
        {savePreferencesMutation.isError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Failed to save preferences. Please try again.
          </Alert>
        )}
      </Box>
    );
  }

  // Show Update Preferences dialog if user clicks the button
  if (showQuestionnaire === true) {
    return (
      <Box>
        <Button
          onClick={() => setShowQuestionnaire(null)}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          ← Back to Roadmap
        </Button>
        <RoadmapQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onSkip={() => setShowQuestionnaire(null)}
        />
        {savePreferencesMutation.isPending && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Updating your roadmap...</Typography>
          </Box>
        )}
      </Box>
    );
  }

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
        <Box sx={{ display: 'flex', gap: 2 }}>
          {preferencesData?.hasPreferences && (
            <Button
              variant="outlined"
              onClick={() => setShowQuestionnaire(true)}
            >
              Update Preferences
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={regenerateMutation.isPending ? <CircularProgress size={16} /> : <Refresh />}
            onClick={() => setRegenerateDialogOpen(true)}
            disabled={regenerateMutation.isPending}
          >
            Regenerate Roadmap
          </Button>
        </Box>
      </Box>

      {/* User Summary Section */}
      {(roadmapData?.userSummary || preferencesData?.summary) && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: `1px solid ${theme.palette.primary.main}`,
            bgcolor: theme.palette.primary.main + '08',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CheckCircle color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Your Learning Profile
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            {roadmapData?.userSummary || preferencesData?.summary}
          </Typography>
          
          {/* Display preferences as chips */}
          {(roadmapData?.preferences || preferencesData?.preferences) && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip 
                  label={`${(roadmapData?.preferences || preferencesData?.preferences).timePerDay}h/day`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  label={(roadmapData?.preferences || preferencesData?.preferences).currentLevel} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
                <Chip 
                  label={(roadmapData?.preferences || preferencesData?.preferences).urgency} 
                  size="small" 
                  color="warning" 
                  variant="outlined" 
                />
                <Chip 
                  label={(roadmapData?.preferences || preferencesData?.preferences).learningStyle} 
                  size="small" 
                  color="info" 
                  variant="outlined" 
                />
              </Box>
            </Box>
          )}
        </Paper>
      )}

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
              {Math.round(roadmap?.overallCompletion || roadmap?.overallProgress || 0)}%
            </Typography>
          </Box>
        </Box>
        <ProgressBar
          value={Math.round(roadmap?.overallCompletion || roadmap?.overallProgress || 0)}
          color={
            (roadmap?.overallCompletion || roadmap?.overallProgress || 0) >= 75
              ? 'success'
              : (roadmap?.overallCompletion || roadmap?.overallProgress || 0) >= 50
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
            profile and preferences. Your current roadmap and progress will be
            archived. Are you sure you want to continue?
          </Typography>
          {preferencesData?.hasPreferences && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Your saved preferences will be used to generate the new roadmap.
            </Alert>
          )}
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
