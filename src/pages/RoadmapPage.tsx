import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import { Assessment, Refresh, SmartDisplay } from '@mui/icons-material';
import RoadmapQuestionnaire from '@/components/RoadmapQuestionnaire';
import ProgressBar from '@/components/ui/ProgressBar';
import WeekCard from '@/components/ui/WeekCard';
import { roadmapApi } from '@/api/api';
import type { CourseRoadmapPreferences, Roadmap, RoadmapPreferencesResponse } from '@/types';

export default function RoadmapPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [phaseTab, setPhaseTab] = useState(0);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  const preferencesQuery = useQuery({
    queryKey: ['roadmapPreferences'],
    queryFn: () => roadmapApi.getPreferences().catch((): RoadmapPreferencesResponse => ({ hasPreferences: false })),
  });

  const roadmapQuery = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => roadmapApi.getRoadmap(),
    enabled: !preferencesQuery.isLoading,
  });

  const savePreferencesMutation = useMutation({
    mutationFn: (preferences: CourseRoadmapPreferences) => roadmapApi.savePreferences(preferences),
    onSuccess: () => {
      setShowQuestionnaire(false);
      queryClient.invalidateQueries({ queryKey: ['roadmapPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ week, progress }: { week: number; progress: number }) =>
      roadmapApi.logProgress({ weekNumber: week, completionPercent: progress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['placementSummary'] });
    },
  });

  const activePreferences = (roadmapQuery.data as Roadmap | undefined)?.preferences || preferencesQuery.data?.preferences;
  const roadmap = roadmapQuery.data as Roadmap | undefined;

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      if (!activePreferences) {
        throw new Error('No saved preferences available.');
      }
      await roadmapApi.savePreferences(activePreferences);
      return roadmapApi.getRoadmap();
    },
    onSuccess: () => {
      setRegenerateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['roadmapPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  const phaseGroups = useMemo(() => {
    const plan = roadmap?.weeklyPlan || [];
    return Object.entries(
      plan.reduce<Record<string, typeof plan>>((groups, week) => {
        const key = week.phase || `Week ${week.week}`;
        groups[key] = groups[key] || [];
        groups[key].push(week);
        return groups;
      }, {})
    );
  }, [roadmap?.weeklyPlan]);

  const isLoading = preferencesQuery.isLoading || roadmapQuery.isLoading || savePreferencesMutation.isPending;
  const shouldShowQuestionnaire = showQuestionnaire || !preferencesQuery.data?.hasPreferences;

  const handleQuestionnaireComplete = (preferences: CourseRoadmapPreferences) => {
    savePreferencesMutation.mutate(preferences);
  };

  const handleUpdateProgress = (week: number, progress: number) => {
    updateProgressMutation.mutate({ week, progress });
  };

  if (preferencesQuery.isError) {
    return <Alert severity="error">Failed to load roadmap preferences.</Alert>;
  }

  if (shouldShowQuestionnaire) {
    return (
      <Box>
        <RoadmapQuestionnaire
          onComplete={handleQuestionnaireComplete}
          onSkip={preferencesQuery.data?.hasPreferences ? () => setShowQuestionnaire(false) : undefined}
          initialValues={activePreferences}
        />
        {savePreferencesMutation.isPending && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3 }}>
            <CircularProgress size={24} />
            <Typography>Saving your course setup and generating the roadmap...</Typography>
          </Box>
        )}
        {savePreferencesMutation.isError && (
          <Alert severity="error" sx={{ mt: 3 }}>
            Failed to save the course roadmap inputs. Please try again.
          </Alert>
        )}
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (roadmapQuery.isError || !roadmap) {
    return <Alert severity="error">Failed to load roadmap data.</Alert>;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            {activePreferences?.courseName || 'Course'} Roadmap
          </Typography>
          <Typography variant="body1" color="text.secondary">
            AI-generated study plan based on your level, daily time commitment, and completion window.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setShowQuestionnaire(true)}>
            Edit Inputs
          </Button>
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

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Learning Brief
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          {roadmap.userSummary}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Chip label={`${activePreferences?.currentLevel} level`} color="primary" variant="outlined" />
          <Chip label={`${activePreferences?.timePerDay} hours/day`} color="secondary" variant="outlined" />
          <Chip label={`${activePreferences?.durationValue} ${activePreferences?.durationUnit}`} color="success" variant="outlined" />
          <Chip label={`${roadmap.durationWeeks} weeks total`} color="info" variant="outlined" />
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" fontWeight={700}>
            Overall Progress
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assessment color="primary" />
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {Math.round(roadmap.overallCompletion || roadmap.overallProgress || 0)}%
            </Typography>
          </Box>
        </Box>
        <ProgressBar value={Math.round(roadmap.overallCompletion || roadmap.overallProgress || 0)} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Generated on {roadmap.generatedAt ? new Date(roadmap.generatedAt).toLocaleString() : 'N/A'}
        </Typography>
      </Paper>

      {!!roadmap.globalNotes?.length && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Global Notes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {roadmap.globalNotes.map((note) => (
              <Chip key={note} label={note} sx={{ maxWidth: '100%' }} />
            ))}
          </Box>
        </Paper>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <SmartDisplay color="error" />
          <Typography variant="h6" fontWeight={700}>
            Recommended Videos
          </Typography>
        </Box>
        {roadmap.youtubeVideos?.length ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 2 }}>
            {roadmap.youtubeVideos.map((video) => (
              <Card key={video.id} variant="outlined" sx={{ height: '100%' }}>
                {video.thumbnailUrl && (
                  <Box
                    component="img"
                    src={video.thumbnailUrl}
                    alt={video.title}
                    sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderBottom: `1px solid ${theme.palette.divider}` }}
                  />
                )}
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {video.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {video.channelTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {video.description || 'Open the video to review the full lesson content.'}
                  </Typography>
                  <Button variant="contained" href={video.videoUrl} target="_blank" rel="noreferrer">
                    Open Video
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Alert severity="info">No YouTube resources are available yet for this roadmap.</Alert>
        )}
      </Paper>

      <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
        <Tabs
          value={phaseTab}
          onChange={(_, value) => setPhaseTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          {phaseGroups.map(([phaseName]) => (
            <Tab key={phaseName} label={phaseName} />
          ))}
        </Tabs>
        <Box sx={{ p: 3 }}>
          {phaseGroups.length > 0 ? (
            phaseGroups[phaseTab]?.[1].map((week) => (
              <Box key={week.week} sx={{ mb: 2 }}>
                <WeekCard week={week} onUpdateProgress={handleUpdateProgress} />
              </Box>
            ))
          ) : (
            <Alert severity="info">No weeks available in the generated roadmap.</Alert>
          )}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Full Roadmap
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {roadmap.weeklyPlan.map((week) => (
            <WeekCard key={week.week} week={week} onUpdateProgress={handleUpdateProgress} />
          ))}
        </Box>
      </Paper>

      <Dialog open={regenerateDialogOpen} onClose={() => setRegenerateDialogOpen(false)}>
        <DialogTitle>Regenerate this roadmap?</DialogTitle>
        <DialogContent>
          <Typography>
            This will generate a fresh roadmap for {activePreferences?.courseName} using your current saved inputs and replace the active roadmap.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegenerateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => regenerateMutation.mutate()} disabled={regenerateMutation.isPending}>
            {regenerateMutation.isPending ? 'Generating...' : 'Regenerate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
