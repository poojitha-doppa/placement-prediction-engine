import { Card, CardContent, Typography, useTheme } from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { RadarSkillGapChartProps } from '@/types';

export default function RadarSkillGapChart({
  current,
  target,
  height = 400,
}: RadarSkillGapChartProps) {
  const theme = useTheme();

  // Transform data for radar chart
  const data = [
    {
      skill: 'DSA',
      current: current.dsa,
      target: target.dsa,
    },
    {
      skill: 'CS Fundamentals',
      current: current.csFundamentals,
      target: target.csFundamentals,
    },
    {
      skill: 'System Design',
      current: current.systemDesign,
      target: target.systemDesign,
    },
    {
      skill: 'Language',
      current: current.language,
      target: target.language,
    },
    {
      skill: 'Behavioral',
      current: current.behavioral,
      target: target.behavioral,
    },
  ];

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
          Skill Gap Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Current vs Target Skill Levels
        </Typography>
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data}>
            <PolarGrid stroke={theme.palette.divider} />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar
              name="Current Level"
              dataKey="current"
              stroke={theme.palette.primary.main}
              fill={theme.palette.primary.main}
              fillOpacity={0.4}
            />
            <Radar
              name="Target Level"
              dataKey="target"
              stroke={theme.palette.success.main}
              fill={theme.palette.success.main}
              fillOpacity={0.4}
            />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
