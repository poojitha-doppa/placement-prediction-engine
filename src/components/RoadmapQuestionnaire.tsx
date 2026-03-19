import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { CourseRoadmapPreferences } from '@/types';

interface Props {
  onSubmit: (data: CourseRoadmapPreferences) => void;
  isSubmitting?: boolean;
  initialValues?: Partial<CourseRoadmapPreferences>;
}

export default function RoadmapQuestionnaire({ onSubmit, isSubmitting = false, initialValues }: Props) {
  const [formData, setFormData] = useState<CourseRoadmapPreferences>({
    courseName: initialValues?.courseName || '',
    currentLevel: initialValues?.currentLevel || 'beginner',
    timePerDay: initialValues?.timePerDay || 2,
    durationValue: initialValues?.durationValue || 8,
    durationUnit: initialValues?.durationUnit || 'weeks',
    experienceNotes: '',
    additionalNotes: '',
  });

  const isFormValid =
    formData.courseName.trim().length >= 2 &&
    formData.timePerDay > 0 &&
    formData.durationValue > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          Course Roadmap Form
        </Typography>
      </Box>

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="1. Which course do you want to learn?"
          placeholder="Example: React.js"
          value={formData.courseName}
          onChange={(event) => setFormData((current) => ({ ...current, courseName: event.target.value }))}
        />

        <TextField
          fullWidth
          type="number"
          label="2. Time commitment (hours per day)"
          value={formData.timePerDay}
          onChange={(event) => setFormData((current) => ({
            ...current,
            timePerDay: Number(event.target.value) || 0,
          }))}
          inputProps={{ min: 0.5, step: 0.5, max: 24 }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 180px' }, gap: 2 }}>
          <TextField
            fullWidth
            type="number"
            label="3. Completion time"
            value={formData.durationValue}
            onChange={(event) => setFormData((current) => ({
              ...current,
              durationValue: Number(event.target.value) || 0,
            }))}
            inputProps={{ min: 1, max: 365 }}
          />
          <FormControl fullWidth>
            <InputLabel id="duration-unit-label">Unit</InputLabel>
            <Select
              labelId="duration-unit-label"
              label="Unit"
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

        <FormControl fullWidth>
          <InputLabel id="level-label">4. Your level</InputLabel>
          <Select
            labelId="level-label"
            label="4. Your level"
            value={formData.currentLevel === 'expert' ? 'advanced' : formData.currentLevel}
            onChange={(event) => setFormData((current) => ({
              ...current,
              currentLevel: event.target.value as CourseRoadmapPreferences['currentLevel'],
            }))}
          >
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Medium</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>


        <Button
          variant="contained"
          size="large"
          disabled={!isFormValid || isSubmitting}
          onClick={() => onSubmit(formData)}
        >
          {isSubmitting ? 'Generating Roadmap...' : 'Generate Roadmap'}
        </Button>
      </Stack>
    </Paper>
  );
}
