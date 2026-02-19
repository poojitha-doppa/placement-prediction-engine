import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Chip,
  Alert,
  Stack,
  Stepper,
  Step,
  StepLabel,
  useTheme,
} from '@mui/material';
import { CheckCircle, ArrowForward, ArrowBack } from '@mui/icons-material';

interface QuestionnaireData {
  learningPurpose: string;
  specificGoals: string[];
  currentLevel: string;
  timePerDay: number;
  timePerWeek: number;
  learningStyle: string;
  targetDate: string;
  urgency: string;
  weakAreas: string[];
  additionalNotes: string;
}

interface Props {
  onComplete: (data: QuestionnaireData) => void;
  onSkip?: () => void;
}

const goalOptions = [
  'Get placed in top tech company',
  'Improve DSA skills',
  'Master System Design',
  'Learn specific technologies',
  'Crack coding interviews',
  'Build projects',
  'Competitive programming'
];

const skillLevels = [
  { value: 'beginner', label: 'Beginner (Just starting)' },
  { value: 'intermediate', label: 'Intermediate (Some experience)' },
  { value: 'advanced', label: 'Advanced (Strong foundation)' },
  { value: 'expert', label: 'Expert (Interview ready)' }
];

const learningStyles = [
  { value: 'visual', label: 'Visual (Videos, diagrams)' },
  { value: 'reading', label: 'Reading (Articles, documentation)' },
  { value: 'practical', label: 'Practical (Hands-on coding)' },
  { value: 'mixed', label: 'Mixed approach' }
];

const weakAreaOptions = [
  'Data Structures',
  'Algorithms',
  'Dynamic Programming',
  'Graphs',
  'System Design',
  'Databases',
  'Operating Systems',
  'Computer Networks',
  'Problem Solving Speed'
];

export default function RoadmapQuestionnaire({ onComplete, onSkip }: Props) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<QuestionnaireData>({
    learningPurpose: '',
    specificGoals: [],
    currentLevel: 'intermediate',
    timePerDay: 2,
    timePerWeek: 14,
    learningStyle: 'mixed',
    targetDate: '',
    urgency: 'moderate',
    weakAreas: [],
    additionalNotes: ''
  });

  const steps = [
    'Goals & Purpose',
    'Current Level',
    'Time Commitment',
    'Learning Preferences'
  ];

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      specificGoals: prev.specificGoals.includes(goal)
        ? prev.specificGoals.filter(g => g !== goal)
        : [...prev.specificGoals, goal]
    }));
  };

  const handleWeakAreaToggle = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      weakAreas: prev.weakAreas.includes(area)
        ? prev.weakAreas.filter(a => a !== area)
        : [...prev.weakAreas, area]
    }));
  };

  const handleSubmit = () => {
    onComplete(formData);
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.learningPurpose.trim().length > 0 && formData.specificGoals.length > 0;
      case 1:
        return formData.currentLevel !== '';
      case 2:
        return formData.timePerDay > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                What is your primary purpose for this learning roadmap?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="e.g., I want to get placed in Google as a Software Engineer by July 2026..."
                value={formData.learningPurpose}
                onChange={(e) => setFormData({ ...formData, learningPurpose: e.target.value })}
                sx={{ mt: 2 }}
              />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Select your specific goals (choose multiple)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {goalOptions.map((goal) => (
                  <Chip
                    key={goal}
                    label={goal}
                    onClick={() => handleGoalToggle(goal)}
                    color={formData.specificGoals.includes(goal) ? 'primary' : 'default'}
                    variant={formData.specificGoals.includes(goal) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                When do you want to achieve your goal?
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ mt: 2 }}
              />
            </Box>
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                What is your current skill level?
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <RadioGroup
                  value={formData.currentLevel}
                  onChange={(e) => setFormData({ ...formData, currentLevel: e.target.value })}
                >
                  {skillLevels.map((level) => (
                    <FormControlLabel
                      key={level.value}
                      value={level.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {level.label}
                          </Typography>
                        </Box>
                      }
                      sx={{
                        mb: 1,
                        p: 2,
                        border: `1px solid ${
                          formData.currentLevel === level.value
                            ? theme.palette.primary.main
                            : theme.palette.divider
                        }`,
                        borderRadius: 1,
                        bgcolor: formData.currentLevel === level.value 
                          ? theme.palette.primary.main + '10'
                          : 'transparent'
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                What are your weak areas? (select all that apply)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {weakAreaOptions.map((area) => (
                  <Chip
                    key={area}
                    label={area}
                    onClick={() => handleWeakAreaToggle(area)}
                    color={formData.weakAreas.includes(area) ? 'error' : 'default'}
                    variant={formData.weakAreas.includes(area) ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                How much time can you dedicate daily?
              </Typography>
              <Box sx={{ px: 2, mt: 3 }}>
                <Slider
                  value={formData.timePerDay}
                  onChange={(_, value) => {
                    const hours = value as number;
                    setFormData({ 
                      ...formData, 
                      timePerDay: hours,
                      timePerWeek: hours * 7
                    });
                  }}
                  min={0.5}
                  max={8}
                  step={0.5}
                  marks={[
                    { value: 0.5, label: '30 min' },
                    { value: 2, label: '2 hrs' },
                    { value: 4, label: '4 hrs' },
                    { value: 6, label: '6 hrs' },
                    { value: 8, label: '8 hrs' }
                  ]}
                  valueLabelDisplay="on"
                  valueLabelFormat={(value) => `${value} hrs/day`}
                />
              </Box>
              <Alert severity="info" sx={{ mt: 3 }}>
                This translates to approximately <strong>{formData.timePerWeek} hours per week</strong>
              </Alert>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                How urgent is your goal?
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <RadioGroup
                  row
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                >
                  <FormControlLabel 
                    value="relaxed" 
                    control={<Radio />} 
                    label="Relaxed (No rush)" 
                  />
                  <FormControlLabel 
                    value="moderate" 
                    control={<Radio />} 
                    label="Moderate" 
                  />
                  <FormControlLabel 
                    value="urgent" 
                    control={<Radio />} 
                    label="Urgent (ASAP)" 
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                What is your preferred learning style?
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <RadioGroup
                  value={formData.learningStyle}
                  onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value })}
                >
                  {learningStyles.map((style) => (
                    <FormControlLabel
                      key={style.value}
                      value={style.value}
                      control={<Radio />}
                      label={style.label}
                      sx={{
                        mb: 1,
                        p: 2,
                        border: `1px solid ${
                          formData.learningStyle === style.value
                            ? theme.palette.primary.main
                            : theme.palette.divider
                        }`,
                        borderRadius: 1,
                        bgcolor: formData.learningStyle === style.value 
                          ? theme.palette.primary.main + '10'
                          : 'transparent'
                      }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Any additional notes or specific requirements?
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="e.g., I prefer Python over Java, need to focus more on system design, have classes till 4 PM..."
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                sx={{ mt: 2 }}
              />
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 4, border: `1px solid ${theme.palette.divider}` }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Let's Create Your Personalized Roadmap
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Answer a few questions to help us understand your goals and create a tailored learning path
        </Typography>
      </Box>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '400px', mb: 4 }}>
        {renderStepContent()}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>

        {onSkip && activeStep === 0 && (
          <Button onClick={onSkip} color="inherit">
            Skip & Use Default
          </Button>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!isStepValid()}
              startIcon={<CheckCircle />}
            >
              Generate My Roadmap
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid()}
              endIcon={<ArrowForward />}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
