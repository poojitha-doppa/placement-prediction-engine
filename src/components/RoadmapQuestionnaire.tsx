import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Stack,
  useTheme,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

interface QuestionnaireData {
  whatToLearn: string;
  timeLeft: string;
  hoursPerDay: number;
}

interface Props {
  onComplete: (data: QuestionnaireData) => void;
  onSkip?: () => void;
}

export default function RoadmapQuestionnaire({ onComplete, onSkip }: Props) {
  const theme = useTheme();
  const [formData, setFormData] = useState<QuestionnaireData>({
    whatToLearn: '',
    timeLeft: '',
    hoursPerDay: 2,
  });

  const handleSubmit = () => {
    if (formData.whatToLearn.trim() && formData.timeLeft.trim() && formData.hoursPerDay > 0) {
      onComplete(formData);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          textAlign="center"
          fontWeight="bold"
          color="primary"
        >
          Create Your Learning Roadmap
        </Typography>

        <Typography
          variant="body1"
          textAlign="center"
          sx={{ mb: 4, color: 'text.secondary' }}
        >
          Tell us about your learning goals and we'll create a personalized roadmap for you.
        </Typography>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Learning Goal"
            placeholder="e.g., Data Structures and Algorithms, System Design, React, etc."
            value={formData.whatToLearn}
            onChange={(e) => setFormData({ ...formData, whatToLearn: e.target.value })}
            multiline
            rows={2}
            required
          />

          <TextField
            fullWidth
            label="Time Available"
            placeholder="e.g., 3 months, 6 weeks, until June 2026"
            value={formData.timeLeft}
            onChange={(e) => setFormData({ ...formData, timeLeft: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Daily Hours"
            type="number"
            value={formData.hoursPerDay}
            onChange={(e) => setFormData({ ...formData, hoursPerDay: parseInt(e.target.value) || 0 })}
            inputProps={{ min: 1, max: 12 }}
            required
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={!formData.whatToLearn.trim() || !formData.timeLeft.trim() || formData.hoursPerDay <= 0}
            sx={{
              mt: 2,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            <CheckCircle sx={{ mr: 1 }} />
            Generate My Roadmap
          </Button>

          {onSkip && (
            <Button
              variant="text"
              onClick={onSkip}
              sx={{ mt: 1 }}
            >
              Skip for now
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

