import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import RoadmapQuestionnaire from '@/components/RoadmapQuestionnaire';
import { roadmapApi } from '@/api/api';
import type { CourseRoadmapPreferences, Roadmap } from '@/types';

const formatDuration = (preferences: CourseRoadmapPreferences) =>
  `${preferences.durationValue} ${preferences.durationUnit}`;

export default function RoadmapPage() {
  const queryClient = useQueryClient();

  const roadmapQuery = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => roadmapApi.getRoadmap(),
  });

  const generateRoadmapMutation = useMutation({
    mutationFn: async (preferences: CourseRoadmapPreferences) => {
      await roadmapApi.savePreferences(preferences);
      return roadmapApi.getRoadmap();
    },
    onSuccess: (generatedRoadmap) => {
      queryClient.setQueryData(['roadmap'], generatedRoadmap);
    },
  });

  const roadmap = (generateRoadmapMutation.data || roadmapQuery.data) as Roadmap | undefined;
  const preferences = roadmap?.preferences || undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Course Roadmap
        </Typography>
      </Box>

      <RoadmapQuestionnaire
        onSubmit={(values) => generateRoadmapMutation.mutate(values)}
        isSubmitting={generateRoadmapMutation.isPending}
        initialValues={preferences}
      />

      {generateRoadmapMutation.isError && (
        <Alert severity="error">Failed to generate roadmap. Please try again.</Alert>
      )}

      {roadmapQuery.isError && !roadmap && (
        <Alert severity="error">Failed to load roadmap data.</Alert>
      )}

      {roadmapQuery.isLoading && !roadmap && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!!roadmap?.weeklyPlan?.length && (
        <Paper elevation={0} sx={{ p: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            Generated Roadmap
          </Typography>

          {!!preferences && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {preferences.courseName} | {preferences.currentLevel === 'intermediate' ? 'medium' : preferences.currentLevel} |{' '}
              {preferences.timePerDay} hrs/day | {formatDuration(preferences)}
            </Typography>
          )}

          {roadmap.userSummary && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              {roadmap.userSummary}
            </Typography>
          )}

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {roadmap.weeklyPlan.map((week) => (
              <Paper
                key={week.week}
                variant="outlined"
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Week {week.week}: {week.phase || 'Plan'}
                </Typography>

                {week.focusAreas?.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Focus: {week.focusAreas.join(', ')}
                  </Typography>
                )}

                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Targets:
                </Typography>
                <Box component="ul" sx={{ mt: 0, mb: 0, pl: 2.5 }}>
                  {week.targets.map((target) => (
                    <Typography component="li" key={target} variant="body2" sx={{ mb: 0.5 }}>
                      {target}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
