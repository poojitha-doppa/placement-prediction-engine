import { Card, CardContent, Typography, useTheme } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { LineChartSkillsProps } from '@/types';

export default function LineChartSkills({
  data,
  height = 300,
}: LineChartSkillsProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Skill Progression Over Time
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis
              dataKey="week"
              label={{ value: 'Week', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Skill Level', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="dsa"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              name="DSA"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="csFundamentals"
              stroke={theme.palette.success.main}
              strokeWidth={2}
              name="CS Fundamentals"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="systemDesign"
              stroke={theme.palette.warning.main}
              strokeWidth={2}
              name="System Design"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="language"
              stroke={theme.palette.error.main}
              strokeWidth={2}
              name="Language"
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="behavioral"
              stroke={theme.palette.info.main}
              strokeWidth={2}
              name="Behavioral"
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
