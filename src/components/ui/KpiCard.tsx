import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { KpiCardProps } from '@/types';

export default function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'primary',
}: KpiCardProps) {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case 'up':
        return <TrendingUp fontSize="small" color="success" />;
      case 'down':
        return <TrendingDown fontSize="small" color="error" />;
      default:
        return <TrendingFlat fontSize="small" color="disabled" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text.secondary';
    switch (trend.direction) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="text.secondary" variant="body2" fontWeight={500}>
            {title}
          </Typography>
          {icon && (
            <Box sx={{ color: `${color}.main`, opacity: 0.8 }}>{icon}</Box>
          )}
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {value}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {trend && (
            <>
              {getTrendIcon()}
              <Typography
                variant="body2"
                sx={{ color: getTrendColor(), fontWeight: 500 }}
              >
                {trend.value > 0 ? '+' : ''}
                {trend.value}%
              </Typography>
            </>
          )}
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: trend ? 1 : 0 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
