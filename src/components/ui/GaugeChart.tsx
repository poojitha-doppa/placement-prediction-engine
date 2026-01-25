import { Box, Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { GaugeChartProps } from '@/types';

export default function GaugeChart({
  value,
  label,
  color,
  size = 200,
}: GaugeChartProps) {
  const theme = useTheme();
  const defaultColor = color || theme.palette.primary.main;

  // Create data for semi-circle gauge
  const data = [
    { name: 'value', value: value },
    { name: 'empty', value: 100 - value },
  ];

  const COLORS = [defaultColor, theme.palette.grey[200]];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ position: 'relative', width: size, height: size * 0.6 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center value */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
          }}
        >
          <Typography variant="h3" fontWeight="bold" color={defaultColor}>
            {value}%
          </Typography>
        </Box>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, textAlign: 'center' }}
      >
        {label}
      </Typography>
    </Box>
  );
}
