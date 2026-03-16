import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';
import type { CourseRoadmapPreferences } from '@/types';

interface Props {
  onComplete: (data: CourseRoadmapPreferences) => void;
  onSkip?: () => void;
  initialValues?: Partial<CourseRoadmapPreferences>;
}

const steps = ['Course', 'Level', 'Schedule', 'Notes'];

const levelOptions: Array<{
  value: CourseRoadmapPreferences['currentLevel'];
  label: string;
  helper: string;
}> = [
  { value: 'beginner', label: 'Beginner', helper: 'You need fundamentals, guided pacing, and repetition.' },
  { value: 'intermediate', label: 'Intermediate', helper: 'You know some basics and want structured depth.' },
  { value: 'advanced', label: 'Advanced', helper: 'You want a faster path focused on tougher work.' },
  { value: 'expert', label: 'Expert', helper: 'You are refining mastery, edge cases, and depth.' },
];

export default function RoadmapQuestionnaire({ onComplete, onSkip, initialValues }: Props) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<CourseRoadmapPreferences>({
    courseName: initialValues?.courseName || '',
    currentLevel: initialValues?.currentLevel || 'beginner',
    timePerDay: initialValues?.timePerDay || 2,
    durationValue: initialValues?.durationValue || 8,
    durationUnit: initialValues?.durationUnit || 'weeks',
    experienceNotes: initialValues?.experienceNotes || '',
    additionalNotes: initialValues?.additionalNotes || '',
  });

  const durationPreviewWeeks = useMemo(() => {
    const totalDays = formData.durationUnit === 'days'
      ? formData.durationValue
      : formData.durationUnit === 'weeks'
      ? formData.durationValue * 7
      : formData.durationValue * 30;
    return Math.max(1, Math.ceil(totalDays / 7));
  }, [formData.durationUnit, formData.durationValue]);

  const isCurrentStepValid = () => {
    if (activeStep === 0) {
      return formData.courseName.trim().length >= 2;
    }
    if (activeStep === 1) {
      return Boolean(formData.currentLevel);
    }
    if (activeStep === 2) {
      return formData.timePerDay > 0 && formData.durationValue > 0;
    }
    return true;
  };

  const renderStep = () => {
    if (activeStep === 0) {
      return (
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              What course or topic do you want to learn?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the exact subject. Gemini uses this as the core topic for the generated roadmap.
            </Typography>
            <TextField
              fullWidth
              label="Course or topic"
              placeholder="Examples: React.js, Machine Learning, Java DSA, Node.js"
              value={formData.courseName}
              onChange={(event) => setFormData((current) => ({ ...current, courseName: event.target.value }))}
            />
          </Box>
          <Alert severity="info">
            Better specificity leads to better roadmaps. “React.js with hooks and routing” is better than “frontend”.
          </Alert>
        </Stack>
      );
    }

    if (activeStep === 1) {
      return (
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              What level are you at right now?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This controls pace, sequencing, and how much revision the roadmap includes.
            </Typography>
          </Box>
          <FormControl>
            <RadioGroup
              value={formData.currentLevel}
              onChange={(event) => setFormData((current) => ({
                ...current,
                currentLevel: event.target.value as CourseRoadmapPreferences['currentLevel'],
              }))}
            >
              {levelOptions.map((option) => (
                <Paper
                  key={option.value}
                  variant="outlined"
                  sx={{
                    mb: 1.5,
                    borderColor: formData.currentLevel === option.value ? theme.palette.primary.main : theme.palette.divider,
                    bgcolor: formData.currentLevel === option.value ? theme.palette.primary.main + '0D' : 'transparent',
                  }}
                >
                  <FormControlLabel
                    value={option.value}
                    control={<Radio />}
                    label={
                      <Box sx={{ py: 1 }}>
                        <Typography fontWeight={700}>{option.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.helper}
                        </Typography>
                      </Box>
                    }
                    sx={{ width: '100%', m: 0, px: 2 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          </FormControl>
        </Stack>
      );
    }

    if (activeStep === 2) {
      return (
        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              How much time can you spend each day?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This drives the workload in every generated week.
            </Typography>
            <Box sx={{ px: 1 }}>
              <Slider
                min={0.5}
                max={8}
                step={0.5}
                value={formData.timePerDay}
                onChange={(_, value) => setFormData((current) => ({ ...current, timePerDay: value as number }))}
                valueLabelDisplay="on"
                valueLabelFormat={(value) => `${value} hrs/day`}
                marks={[
                  { value: 0.5, label: '0.5h' },
                  { value: 2, label: '2h' },
                  { value: 4, label: '4h' },
                  { value: 6, label: '6h' },
                  { value: 8, label: '8h' },
                ]}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              How much total time do you have to complete it?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose the full completion window. The roadmap length is generated from this value.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 180px' }, gap: 2 }}>
              <TextField
                type="number"
                label="Duration value"
                value={formData.durationValue}
                onChange={(event) => setFormData((current) => ({
                  ...current,
                  durationValue: Number(event.target.value) || 1,
                }))}
                inputProps={{ min: 1, max: 365 }}
              />
              <FormControl fullWidth>
                <Select
                  value={formData.durationUnit}
                  onChange={(event) => setFormData((current) => ({
                    ...current,
                    durationUnit: event.target.value as CourseRoadmapPreferences['durationUnit'],
                  }))}
                >
                  <MenuItem value="days">Days</MenuItem>
                  <MenuItem value="weeks">Weeks</MenuItem>
                  <MenuItem value="months">Months</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Alert severity="success" sx={{ mt: 2 }}>
              The generated plan will span about <strong>{durationPreviewWeeks} week{durationPreviewWeeks === 1 ? '' : 's'}</strong>.
            </Alert>
          </Box>
        </Stack>
      );
    }

    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Add context for a sharper roadmap
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These notes are optional, but they help Gemini tailor the roadmap and help the app surface more relevant YouTube videos.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Experience notes"
            placeholder="Examples: I know JavaScript basics but not async code. I have built one small Python project."
            value={formData.experienceNotes}
            onChange={(event) => setFormData((current) => ({ ...current, experienceNotes: event.target.value }))}
          />
        </Box>
        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Additional notes"
          placeholder="Examples: Prefer project-based learning, want free resources, can study mostly on weekends."
          value={formData.additionalNotes}
          onChange={(event) => setFormData((current) => ({ ...current, additionalNotes: event.target.value }))}
        />
        <Alert severity="info">
          The roadmap comes from Gemini. The recommended videos come from the YouTube API when a YouTube API key is configured.
        </Alert>
      </Stack>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}08 100%)`,
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Build Your Course Roadmap
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter the course, your current level, your daily time commitment, and your completion window. The app will generate a tailored roadmap and fetch useful videos automatically.
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step}>
            <StepLabel>{step}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 320, mb: 4 }}>{renderStep()}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
          disabled={activeStep === 0}
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {onSkip && activeStep === 0 && (
            <Button color="inherit" onClick={onSkip}>
              Cancel
            </Button>
          )}
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={() => onComplete(formData)}
              disabled={!isCurrentStepValid()}
            >
              Generate Roadmap
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}
              disabled={!isCurrentStepValid()}
            >
              Continue
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
