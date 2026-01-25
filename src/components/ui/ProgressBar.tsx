import { Box, Typography, LinearProgress, useTheme } from '@mui/material';
import { ProgressBarProps } from '@/types';

export default function ProgressBar({
  value,
  label,
  showPercentage = true,
  color = 'primary',
}: ProgressBarProps) {
  const theme = useTheme();

  return (
    <Box>
      {label && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {showPercentage && (
            <Typography variant="body2" fontWeight={500}>
              {value}%
            </Typography>
          )}
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={value}
        color={color}
        sx={{
          height: 10,
          borderRadius: 1,
          backgroundColor: theme.palette.grey[200],
        }}
      />
    </Box>
  );
}
