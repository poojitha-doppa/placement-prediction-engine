import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

export default function LoadingSpinner({ message = 'Loading...', size = 60 }: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        gap: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
        }}
      >
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color: 'primary.main',
            animationDuration: '800ms',
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress
            size={size * 0.7}
            thickness={4}
            sx={{
              color: 'secondary.main',
              animationDuration: '1200ms',
            }}
          />
        </Box>
      </Box>
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    </Box>
  );
}
