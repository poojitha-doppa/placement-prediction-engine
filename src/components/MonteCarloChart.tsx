import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

interface SimulationData {
  probability: number;
  prediction: number;
}

interface MonteCarloChartProps {
  simulations?: SimulationData[];
  height?: number;
  title?: string;
}

export default function MonteCarloChart({
  simulations = [],
  height = 400,
  title = 'Monte Carlo Simulations',
}: MonteCarloChartProps) {
  const theme = useTheme();

  // Sample data for line chart to improve performance (show every 5th point)
  const sampleRate = Math.max(1, Math.floor(simulations.length / 50)); // Max 50 points for line chart
  const lineData = simulations
    .filter((_, index) => index % sampleRate === 0)
    .map((sim, index) => ({
      index: index * sampleRate,
      probability: (sim.probability * 100).toFixed(2),
      prediction: sim.prediction,
    }));

  // Create histogram data (bins) - optimized for performance
  const createHistogram = () => {
    if (simulations.length === 0) return [];

    const bins = 10;
    const binSize = 1 / bins;
    const histogram: { bin: string; count: number }[] = [];

    // Use a more efficient approach with a single pass
    const binCounts = new Array(bins).fill(0);

    simulations.forEach((s) => {
      const binIndex = Math.min(bins - 1, Math.floor(s.probability / binSize));
      binCounts[binIndex]++;
    });

    for (let i = 0; i < bins; i++) {
      const binStart = i * binSize;
      const binEnd = (i + 1) * binSize;
      histogram.push({
        bin: `${(binStart * 100).toFixed(0)}-${(binEnd * 100).toFixed(0)}%`,
        count: binCounts[i],
      });
    }

    return histogram;
  };

  const histogramData = createHistogram();

  // Colors
  const primaryColor = theme.palette.primary.main;
  const successColor = theme.palette.success.main;

  return (
    <Box>
      {/* Line Chart - Simulations Over Time */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Probability distribution across {simulations.length} simulations
        </Typography>

        {simulations.length === 0 ? (
          <Box
            sx={{
              height,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <Typography color="text.secondary">No simulation data available</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="index"
                stroke={theme.palette.text.secondary}
                label={{ value: 'Simulation Run', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
                formatter={(value) => `${value}%`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="probability"
                stroke={primaryColor}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                name="Placement Probability"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Box>

      {/* Histogram - Distribution */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Probability Distribution (Histogram)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Frequency of probability outcomes in bins
        </Typography>

        {histogramData.length === 0 ? (
          <Box
            sx={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <Typography color="text.secondary">No histogram data available</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="bin"
                stroke={theme.palette.text.secondary}
                label={{ value: 'Probability Range', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                stroke={theme.palette.text.secondary}
                label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="count" fill={successColor} name="Frequency" radius={[8, 8, 0, 0]}>
                {histogramData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={successColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Box>
  );
}
