import { Box, Paper, Typography } from '@mui/material';

export default function SettingsPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" fontWeight={800}>
        Settings
      </Typography>

      <Paper elevation={0} sx={{ p: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h6" gutterBottom>
          Account Settings
        </Typography>
        <Typography color="text.secondary">
          Settings page is now connected from the profile menu and top-right settings icon.
        </Typography>
      </Paper>
    </Box>
  );
}
