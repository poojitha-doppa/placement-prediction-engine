import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import RoadmapQuestionnaire from '@/components/RoadmapQuestionnaire';
import WeekCard from '@/components/ui/WeekCard';
import { roadmapApi } from '@/api/api';
import type {
  CourseRoadmapPreferences,
  ManualRoadmapPayload,
  Roadmap,
  WeeklyPlanItem,
} from '@/types';

type RoadmapTab = 'system' | 'manual';

interface ManualWeekDraft {
  week: number;
  phase: string;
  focusAreasText: string;
  targetsText: string;
  expectedOutcomesText: string;
  estimatedHours: number;
}

interface ManualRoadmapDraft {
  title: string;
  courseName: string;
  currentLevel: CourseRoadmapPreferences['currentLevel'];
  timePerDay: number;
  durationValue: number;
  durationUnit: CourseRoadmapPreferences['durationUnit'];
  globalNotesText: string;
  weeklyPlan: ManualWeekDraft[];
}

const formatDuration = (preferences: CourseRoadmapPreferences) =>
  `${preferences.durationValue} ${preferences.durationUnit}`;

const splitCommaSeparated = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const splitLineSeparated = (value: string) =>
  value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const createEmptyWeek = (week: number): ManualWeekDraft => ({
  week,
  phase: '',
  focusAreasText: '',
  targetsText: '',
  expectedOutcomesText: '',
  estimatedHours: 8,
});

const createDefaultManualDraft = (): ManualRoadmapDraft => ({
  title: 'My Manual Roadmap',
  courseName: '',
  currentLevel: 'beginner',
  timePerDay: 2,
  durationValue: 16,
  durationUnit: 'weeks',
  globalNotesText: '',
  weeklyPlan: [createEmptyWeek(1)],
});

const roadmapToManualDraft = (roadmap?: Roadmap | null): ManualRoadmapDraft => {
  if (!roadmap?.weeklyPlan?.length) {
    return createDefaultManualDraft();
  }

  const preferences = roadmap.preferences;

  return {
    title: roadmap.title || 'My Manual Roadmap',
    courseName: preferences?.courseName || '',
    currentLevel: preferences?.currentLevel || 'beginner',
    timePerDay: preferences?.timePerDay || 2,
    durationValue: preferences?.durationValue || roadmap.durationWeeks || 8,
    durationUnit: preferences?.durationUnit || 'weeks',
    globalNotesText: (roadmap.globalNotes || []).join('\n'),
    weeklyPlan: roadmap.weeklyPlan.map((week) => ({
      week: week.week,
      phase: week.phase || '',
      focusAreasText: week.focusAreas.join(', '),
      targetsText: week.targets.join('\n'),
      expectedOutcomesText: week.expectedOutcomes.join('\n'),
      estimatedHours: week.estimatedHours || 8,
    })),
  };
};

const draftToPayload = (draft: ManualRoadmapDraft): ManualRoadmapPayload => ({
  title: draft.title.trim(),
  courseName: draft.courseName.trim(),
  currentLevel: draft.currentLevel,
  timePerDay: draft.timePerDay,
  durationValue: draft.durationValue,
  durationUnit: draft.durationUnit,
  globalNotes: splitLineSeparated(draft.globalNotesText),
  weeklyPlan: draft.weeklyPlan.map((week) => ({
    week: week.week,
    phase: week.phase.trim() || `Week ${week.week} Focus`,
    focusAreas: splitCommaSeparated(week.focusAreasText),
    targets: splitLineSeparated(week.targetsText),
    expectedOutcomes: splitLineSeparated(week.expectedOutcomesText),
    estimatedHours: week.estimatedHours,
    completionPercent: 0,
  })) as WeeklyPlanItem[],
});

const isValidManualDraft = (draft: ManualRoadmapDraft) =>
  draft.title.trim().length >= 2 &&
  draft.courseName.trim().length >= 2 &&
  draft.timePerDay > 0 &&
  draft.durationValue > 0 &&
  draft.weeklyPlan.length > 0 &&
  draft.weeklyPlan.every(
    (week) =>
      splitCommaSeparated(week.focusAreasText).length > 0 &&
      splitLineSeparated(week.targetsText).length > 0 &&
      splitLineSeparated(week.expectedOutcomesText).length > 0 &&
      week.estimatedHours > 0
  );

function RoadmapPreview({
  title,
  roadmap,
  emptyMessage,
}: {
  title: string;
  roadmap?: Roadmap;
  emptyMessage: string;
}) {
  const preferences = roadmap?.preferences || undefined;

  return (
    <Paper elevation={0} sx={{ p: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        {title}
      </Typography>

      {!roadmap?.weeklyPlan?.length ? (
        <Alert severity="info">{emptyMessage}</Alert>
      ) : (
        <>
          {!!preferences && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {preferences.courseName} |{' '}
              {preferences.currentLevel === 'intermediate' ? 'medium' : preferences.currentLevel} |{' '}
              {preferences.timePerDay} hrs/day | {formatDuration(preferences)}
            </Typography>
          )}

          {roadmap.userSummary && (
            <Typography variant="body1" sx={{ mb: 3 }}>
              {roadmap.userSummary}
            </Typography>
          )}

          {!!roadmap.globalNotes?.length && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Notes
              </Typography>
              <Box component="ul" sx={{ mt: 0, mb: 0, pl: 2.5 }}>
                {roadmap.globalNotes.map((note) => (
                  <Typography component="li" key={note} variant="body2" sx={{ mb: 0.5 }}>
                    {note}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {roadmap.weeklyPlan.map((week) => (
              <Paper key={week.week} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
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
        </>
      )}
    </Paper>
  );
}

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<RoadmapTab>('system');
  const [manualDraft, setManualDraft] = useState<ManualRoadmapDraft>(createDefaultManualDraft());
  const [manualMessage, setManualMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [systemMessage, setSystemMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [adaptiveActionLabel, setAdaptiveActionLabel] = useState<string | null>(null);

  const roadmapQuery = useQuery({
    queryKey: ['roadmap'],
    queryFn: () => roadmapApi.getRoadmap(),
  });

  const manualRoadmapQuery = useQuery({
    queryKey: ['manual-roadmap'],
    queryFn: () => roadmapApi.getManualRoadmap(),
  });

  const progressHistoryQuery = useQuery({
    queryKey: ['roadmap-progress-history'],
    queryFn: () => roadmapApi.getProgressHistory(),
    enabled: activeTab === 'system',
  });

  useEffect(() => {
    setManualDraft(roadmapToManualDraft(manualRoadmapQuery.data));
  }, [manualRoadmapQuery.data]);

  const generateRoadmapMutation = useMutation({
    mutationFn: async (preferences: CourseRoadmapPreferences) => {
      await roadmapApi.savePreferences(preferences);
      return roadmapApi.getRoadmap();
    },
    onSuccess: (generatedRoadmap) => {
      queryClient.setQueryData(['roadmap'], generatedRoadmap);
    },
  });

  const saveManualRoadmapMutation = useMutation({
    mutationFn: async (draft: ManualRoadmapDraft) => roadmapApi.saveManualRoadmap(draftToPayload(draft)),
    onSuccess: (savedRoadmap) => {
      queryClient.setQueryData(['manual-roadmap'], savedRoadmap);
      setManualDraft(roadmapToManualDraft(savedRoadmap));
      setManualMessage({ type: 'success', text: 'Manual roadmap saved successfully.' });
    },
    onError: (error: any) => {
      setManualMessage({
        type: 'error',
        text: error?.response?.data?.error || error?.response?.data?.message || 'Failed to save manual roadmap.',
      });
    },
  });

  const logProgressMutation = useMutation({
    mutationFn: async ({ weekNumber, completionPercent }: { weekNumber: number; completionPercent: number }) =>
      roadmapApi.logProgress({ weekNumber, completionPercent }),
    onSuccess: async (response: any) => {
      const adaptiveGuidance = response?.adaptiveGuidance;
      setAdaptiveActionLabel(adaptiveGuidance?.shouldRegenerate ? adaptiveGuidance?.actionLabel || 'Regenerate roadmap' : null);
      setSystemMessage({
        type: adaptiveGuidance?.shouldRegenerate ? 'warning' : 'success',
        text: adaptiveGuidance?.message || 'Progress updated successfully.',
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['roadmap'] }),
        queryClient.invalidateQueries({ queryKey: ['roadmap-progress-history'] }),
        queryClient.invalidateQueries({ queryKey: ['placementSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['skillAnalytics'] }),
        queryClient.invalidateQueries({ queryKey: ['optimizationInsights'] }),
      ]);
    },
    onError: (error: any) => {
      setSystemMessage({
        type: 'error',
        text: error?.response?.data?.message || error?.response?.data?.error || 'Failed to update progress.',
      });
    },
  });

  const regenerateRoadmapMutation = useMutation({
    mutationFn: async () => roadmapApi.regenerateRoadmap(),
    onSuccess: async (roadmap) => {
      queryClient.setQueryData(['roadmap'], roadmap);
      setAdaptiveActionLabel(null);
      setSystemMessage({
        type: 'success',
        text: 'System roadmap regenerated from your latest progress, profile, analytics, and company gaps.',
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['roadmap-progress-history'] }),
        queryClient.invalidateQueries({ queryKey: ['placementSummary'] }),
        queryClient.invalidateQueries({ queryKey: ['skillAnalytics'] }),
        queryClient.invalidateQueries({ queryKey: ['optimizationInsights'] }),
      ]);
    },
    onError: (error: any) => {
      setSystemMessage({
        type: 'error',
        text: error?.response?.data?.message || error?.response?.data?.error || 'Failed to regenerate roadmap.',
      });
    },
  });

  const systemRoadmap = (generateRoadmapMutation.data || roadmapQuery.data) as Roadmap | undefined;
  const systemPreferences = systemRoadmap?.preferences || undefined;
  const manualRoadmap = manualRoadmapQuery.data as Roadmap | undefined;
  const progressHistory = progressHistoryQuery.data?.history || [];

  const manualDraftIsValid = useMemo(() => isValidManualDraft(manualDraft), [manualDraft]);

  const updateManualWeek = (weekNumber: number, updates: Partial<ManualWeekDraft>) => {
    setManualDraft((current) => ({
      ...current,
      weeklyPlan: current.weeklyPlan.map((week) =>
        week.week === weekNumber ? { ...week, ...updates } : week
      ),
    }));
  };

  const addManualWeek = () => {
    setManualDraft((current) => ({
      ...current,
      weeklyPlan: [...current.weeklyPlan, createEmptyWeek(current.weeklyPlan.length + 1)],
    }));
  };

  const removeManualWeek = (weekNumber: number) => {
    setManualDraft((current) => {
      const remainingWeeks = current.weeklyPlan
        .filter((week) => week.week !== weekNumber)
        .map((week, index) => ({ ...week, week: index + 1 }));

      return {
        ...current,
        weeklyPlan: remainingWeeks.length > 0 ? remainingWeeks : [createEmptyWeek(1)],
      };
    });
  };

  const copySystemRoadmapToManual = () => {
    if (!systemRoadmap?.weeklyPlan?.length) {
      return;
    }

    setManualDraft(roadmapToManualDraft({
      ...systemRoadmap,
      roadmapType: 'manual',
      title: `Manual Copy - ${systemRoadmap.title || 'System Roadmap'}`,
    }));
    setActiveTab('manual');
    setManualMessage({
      type: 'success',
      text: 'The current system roadmap has been copied into the manual builder. You can now customize it freely.',
    });
  };

  const handleExportRoadmapPdf = async () => {
    const { exportRoadmapToPdf } = await import('@/utils/pdfExport');
    await exportRoadmapToPdf();
  };

  return (
    <Box id="roadmap-content" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Course Roadmap
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Use the system-generated plan for probability-driven recommendations, or keep a separate manual plan that you control yourself.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Tabs
          value={activeTab}
          onChange={(_, value: RoadmapTab) => setActiveTab(value)}
          variant="fullWidth"
        >
          <Tab value="system" label="System Generated" />
          <Tab value="manual" label="Manual Roadmap" />
        </Tabs>
      </Paper>

      {activeTab === 'system' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                System Generated Roadmap
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track progress week by week, keep the default 16-week structure, and regenerate the roadmap when your pace changes.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={copySystemRoadmapToManual}
                disabled={!systemRoadmap?.weeklyPlan?.length}
              >
                Copy To Manual
              </Button>
              <Button
                variant="outlined"
                onClick={() => regenerateRoadmapMutation.mutate()}
                disabled={regenerateRoadmapMutation.isPending || !systemPreferences}
              >
                {regenerateRoadmapMutation.isPending ? 'Regenerating...' : 'Regenerate Roadmap'}
              </Button>
              <Button variant="outlined" onClick={handleExportRoadmapPdf}>
                Export PDF
              </Button>
            </Box>
          </Box>

          <RoadmapQuestionnaire
            onSubmit={(values) => generateRoadmapMutation.mutate(values)}
            isSubmitting={generateRoadmapMutation.isPending}
            initialValues={systemPreferences}
          />

          {systemMessage && (
            <Alert
              severity={systemMessage.type}
              action={
                adaptiveActionLabel ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => regenerateRoadmapMutation.mutate()}
                    disabled={regenerateRoadmapMutation.isPending}
                  >
                    {adaptiveActionLabel}
                  </Button>
                ) : undefined
              }
            >
              {systemMessage.text}
            </Alert>
          )}

          {generateRoadmapMutation.isError && (
            <Alert severity="error">Failed to generate roadmap. Please try again.</Alert>
          )}

          {roadmapQuery.isError && !systemRoadmap && (
            <Alert severity="error">Failed to load roadmap data.</Alert>
          )}

          {roadmapQuery.isLoading && !systemRoadmap && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {!!systemRoadmap?.weeklyPlan?.length && (
            <Paper elevation={0} sx={{ p: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight={800} gutterBottom>
                    Generated Roadmap
                  </Typography>
                  {!!systemPreferences && (
                    <Typography variant="body2" color="text.secondary">
                      {systemPreferences.courseName} |{' '}
                      {systemPreferences.currentLevel === 'intermediate' ? 'medium' : systemPreferences.currentLevel} |{' '}
                      {systemPreferences.timePerDay} hrs/day | {formatDuration(systemPreferences)}
                    </Typography>
                  )}
                </Box>
                <Chip
                  color={systemRoadmap.overallCompletion >= 75 ? 'success' : systemRoadmap.overallCompletion > 0 ? 'warning' : 'default'}
                  label={`Overall progress ${Math.round(systemRoadmap.overallCompletion || 0)}%`}
                />
              </Box>

              {systemRoadmap.userSummary && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {systemRoadmap.userSummary}
                </Typography>
              )}

              {!!systemRoadmap.globalNotes?.length && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Why this roadmap was generated
                  </Typography>
                  <Box component="ul" sx={{ mt: 0, mb: 0, pl: 2.5 }}>
                    {systemRoadmap.globalNotes.map((note) => (
                      <Typography component="li" key={note} variant="body2" sx={{ mb: 0.5 }}>
                        {note}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {systemRoadmap.weeklyPlan.map((week) => (
                  <WeekCard
                    key={week.week}
                    week={week}
                    onUpdateProgress={(weekNumber, completionPercent) => {
                      setSystemMessage(null);
                      logProgressMutation.mutate({ weekNumber, completionPercent });
                    }}
                  />
                ))}
              </Box>

              {!!systemRoadmap.youtubeVideos?.length && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Recommended Learning Videos
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      These resources are attached to your roadmap so you can move from gaps to action faster.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                      gap: 2,
                    }}
                  >
                    {systemRoadmap.youtubeVideos.map((video) => (
                      <Card key={video.id} variant="outlined" sx={{ height: '100%' }}>
                        <CardActionArea
                          component="a"
                          href={video.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          sx={{ height: '100%', alignItems: 'stretch' }}
                        >
                          <CardMedia
                            component="img"
                            height="160"
                            image={video.thumbnailUrl}
                            alt={video.title}
                          />
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                              {video.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {video.channelTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {video.description}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          )}

          {!systemRoadmap?.weeklyPlan?.length && (
            <RoadmapPreview
              title="Generated Roadmap"
              roadmap={systemRoadmap}
              emptyMessage="Save your preferences to generate a system roadmap based on your current profile, analytics, and company gaps."
            />
          )}

          {!!progressHistory.length && (
            <Paper elevation={0} sx={{ p: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Recent Progress Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {progressHistory.slice(-5).reverse().map((entry: any) => (
                  <Box
                    key={`${entry.date}-${entry.weekNumber}-${entry.completionPercent}`}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    }}
                  >
                    <Typography variant="body2">
                      Week {entry.weekNumber} updated on {entry.date}
                    </Typography>
                    <Chip size="small" label={`${entry.completionPercent}% complete`} />
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 'manual' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Manual Roadmap
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maintain your own custom plan without affecting the system roadmap.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={handleExportRoadmapPdf}>
              Export PDF
            </Button>
          </Box>

          {manualMessage && <Alert severity={manualMessage.type}>{manualMessage.text}</Alert>}

          {manualRoadmapQuery.isError && (
            <Alert severity="error">Failed to load your manual roadmap.</Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" fontWeight={800} gutterBottom>
                  Manual Roadmap Builder
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep your own preparation plan without overwriting the system-generated roadmap.
                </Typography>
              </Box>

              <TextField
                label="Roadmap title"
                value={manualDraft.title}
                onChange={(event) => setManualDraft((current) => ({ ...current, title: event.target.value }))}
                fullWidth
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Course or track"
                  value={manualDraft.courseName}
                  onChange={(event) => setManualDraft((current) => ({ ...current, courseName: event.target.value }))}
                  fullWidth
                />
                <TextField
                  select
                  label="Current level"
                  value={manualDraft.currentLevel}
                  onChange={(event) =>
                    setManualDraft((current) => ({
                      ...current,
                      currentLevel: event.target.value as CourseRoadmapPreferences['currentLevel'],
                    }))
                  }
                  fullWidth
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <TextField
                  type="number"
                  label="Hours per day"
                  value={manualDraft.timePerDay}
                  onChange={(event) =>
                    setManualDraft((current) => ({
                      ...current,
                      timePerDay: Number(event.target.value) || 0,
                    }))
                  }
                  inputProps={{ min: 0.5, step: 0.5 }}
                  fullWidth
                />
                <TextField
                  type="number"
                  label="Duration value"
                  value={manualDraft.durationValue}
                  onChange={(event) =>
                    setManualDraft((current) => ({
                      ...current,
                      durationValue: Number(event.target.value) || 0,
                    }))
                  }
                  inputProps={{ min: 1, max: 365 }}
                  fullWidth
                />
                <TextField
                  select
                  label="Duration unit"
                  value={manualDraft.durationUnit}
                  onChange={(event) =>
                    setManualDraft((current) => ({
                      ...current,
                      durationUnit: event.target.value as CourseRoadmapPreferences['durationUnit'],
                    }))
                  }
                  fullWidth
                >
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="weeks">Weeks</MenuItem>
                  <MenuItem value="months">Months</MenuItem>
                </TextField>
              </Box>

              <TextField
                label="Global notes"
                helperText="Use one line per note."
                multiline
                minRows={3}
                value={manualDraft.globalNotesText}
                onChange={(event) =>
                  setManualDraft((current) => ({ ...current, globalNotesText: event.target.value }))
                }
                fullWidth
              />

              <Divider />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Typography variant="h6" fontWeight={700}>
                    Weekly plan
                  </Typography>
                  <Button variant="outlined" onClick={addManualWeek}>
                    Add Week
                  </Button>
                </Box>

                {manualDraft.weeklyPlan.map((week) => (
                  <Paper key={week.week} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Week {week.week}
                        </Typography>
                        <Button
                          color="error"
                          onClick={() => removeManualWeek(week.week)}
                          disabled={manualDraft.weeklyPlan.length === 1}
                        >
                          Remove
                        </Button>
                      </Box>

                      <TextField
                        label="Phase"
                        value={week.phase}
                        onChange={(event) => updateManualWeek(week.week, { phase: event.target.value })}
                        fullWidth
                      />

                      <TextField
                        label="Focus areas"
                        helperText="Separate focus areas with commas."
                        value={week.focusAreasText}
                        onChange={(event) => updateManualWeek(week.week, { focusAreasText: event.target.value })}
                        fullWidth
                      />

                      <TextField
                        label="Targets"
                        helperText="Use one line per target."
                        multiline
                        minRows={3}
                        value={week.targetsText}
                        onChange={(event) => updateManualWeek(week.week, { targetsText: event.target.value })}
                        fullWidth
                      />

                      <TextField
                        label="Expected outcomes"
                        helperText="Use one line per expected outcome."
                        multiline
                        minRows={3}
                        value={week.expectedOutcomesText}
                        onChange={(event) =>
                          updateManualWeek(week.week, { expectedOutcomesText: event.target.value })
                        }
                        fullWidth
                      />

                      <TextField
                        type="number"
                        label="Estimated hours"
                        value={week.estimatedHours}
                        onChange={(event) =>
                          updateManualWeek(week.week, { estimatedHours: Number(event.target.value) || 0 })
                        }
                        inputProps={{ min: 1, max: 40 }}
                        fullWidth
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  size="large"
                  disabled={!manualDraftIsValid || saveManualRoadmapMutation.isPending}
                  onClick={() => {
                    setManualMessage(null);
                    saveManualRoadmapMutation.mutate(manualDraft);
                  }}
                >
                  {saveManualRoadmapMutation.isPending ? 'Saving...' : 'Save Manual Roadmap'}
                </Button>
              </Box>
            </Stack>
          </Paper>

          {manualRoadmapQuery.isLoading && !manualRoadmap && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          )}

          <RoadmapPreview
            title="Manual Roadmap Preview"
            roadmap={manualRoadmap}
            emptyMessage="Build and save your own manual roadmap here. It will stay separate from the system-generated plan."
          />
        </Box>
      )}
    </Box>
  );
}
