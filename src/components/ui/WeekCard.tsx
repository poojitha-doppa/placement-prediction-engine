import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Slider,
  useTheme,
} from '@mui/material';
import { ExpandMore, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
import { WeekCardProps } from '@/types';
import { useState } from 'react';

export default function WeekCard({ week, onUpdateProgress }: WeekCardProps) {
  const theme = useTheme();
  const [progress, setProgress] = useState(week.completionPercent);

  const handleProgressChange = (_event: Event, newValue: number | number[]) => {
    const value = typeof newValue === 'number' ? newValue : newValue[0];
    setProgress(value);
  };

  const handleProgressCommit = (
    _event: React.SyntheticEvent | Event,
    newValue: number | number[]
  ) => {
    const value = typeof newValue === 'number' ? newValue : newValue[0];
    onUpdateProgress(week.week, value);
  };

  const getProgressColor = () => {
    if (progress === 100) return 'success';
    if (progress >= 50) return 'primary';
    if (progress > 0) return 'warning';
    return 'inherit';
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Accordion defaultExpanded={week.week === 1}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            '&:hover': { backgroundColor: theme.palette.action.hover },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box
              sx={{
                backgroundColor:
                  progress === 100
                    ? theme.palette.success.light
                    : theme.palette.primary.light,
                color:
                  progress === 100
                    ? theme.palette.success.dark
                    : theme.palette.primary.dark,
                borderRadius: '50%',
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {week.week}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Week {week.week}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                {week.focusAreas.map((area, idx) => (
                  <Chip key={idx} label={area} size="small" />
                ))}
              </Box>
            </Box>
            <Box sx={{ minWidth: 100, mr: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                color={getProgressColor()}
                sx={{ height: 8, borderRadius: 1 }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: 'block' }}
              >
                {progress}% complete
              </Typography>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ pl: 2 }}>
            {/* Targets */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Targets
              </Typography>
              <List dense>
                {week.targets.map((target, idx) => (
                  <ListItem key={idx} sx={{ pl: 0 }}>
                    {progress >= ((idx + 1) / week.targets.length) * 100 ? (
                      <CheckCircle
                        fontSize="small"
                        color="success"
                        sx={{ mr: 1 }}
                      />
                    ) : (
                      <RadioButtonUnchecked
                        fontSize="small"
                        sx={{ mr: 1, color: 'text.secondary' }}
                      />
                    )}
                    <ListItemText primary={target} />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Expected Outcomes */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Expected Outcomes
              </Typography>
              <List dense>
                {week.expectedOutcomes.map((outcome, idx) => (
                  <ListItem key={idx} sx={{ pl: 0 }}>
                    <ListItemText
                      primary={outcome}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.secondary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Progress Slider */}
            <Box>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                gutterBottom
                sx={{ mb: 2 }}
              >
                Update Progress
              </Typography>
              <Slider
                value={progress}
                onChange={handleProgressChange}
                onChangeCommitted={handleProgressCommit}
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: '0%' },
                  { value: 50, label: '50%' },
                  { value: 100, label: '100%' },
                ]}
                sx={{ maxWidth: 400 }}
              />
            </Box>

            {/* Estimated Hours */}
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`Estimated: ${week.estimatedHours} hours`}
                size="small"
                variant="outlined"
                color="primary"
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Card>
  );
}
