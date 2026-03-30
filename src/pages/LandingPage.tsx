import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  Assessment,
  Bolt,
  Business,
  CheckCircle,
  Insights,
  People,
  School,
  TrendingUp,
  Psychology,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const featureCards = [
  {
    title: 'Skill Gap Analytics',
    description: 'See role-wise readiness scores, weak clusters, and confidence trends in one place.',
    icon: <Assessment sx={{ fontSize: 30 }} />,
  },
  {
    title: 'Personal Roadmaps',
    description: 'Receive weekly tasks based on your college year, target role, and current profile.',
    icon: <TrendingUp sx={{ fontSize: 30 }} />,
  },
  {
    title: 'Company Preparation',
    description: 'Plan prep by company type with interview patterns, rounds, and expected difficulty.',
    icon: <Business sx={{ fontSize: 30 }} />,
  },
  {
    title: 'AI Learning Assistant',
    description: 'Get guided help for resumes, projects, and interview questions with actionable advice.',
    icon: <Psychology sx={{ fontSize: 30 }} />,
  },
];

const stats = [
  { label: 'Preparation Modules', value: '40+' },
  { label: 'Role Templates', value: '20+' },
  { label: 'Weekly Tracking', value: '100%' },
];

const steps = [
  {
    title: 'Build Your Student Profile',
    detail: 'Add skills, academics, and project experience so recommendations become precise.',
    icon: <People fontSize="small" />,
  },
  {
    title: 'Analyze Readiness Instantly',
    detail: 'Get AI-based insight on where you stand for target roles and placement outcomes.',
    icon: <Insights fontSize="small" />,
  },
  {
    title: 'Execute Weekly Roadmap',
    detail: 'Follow a structured plan and track improvements until placement day.',
    icon: <Bolt fontSize="small" />,
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 500px at -10% 20%, rgba(102,126,234,0.20), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(124,58,237,0.14), transparent 60%), linear-gradient(180deg, #faf5ff 0%, #f8fafc 55%, #ffffff 100%)',
      }}
    >
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid rgba(124, 58, 237, 0.14)',
          backgroundColor: 'rgba(250, 245, 255, 0.84)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 2,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <School sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Placement Pilot
              </Typography>
            </Stack>

            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              Login / Sign Up
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={7}>
            <Chip
              label="Placement Preparation Platform"
              sx={{
                mb: 2,
                fontWeight: 700,
                backgroundColor: 'rgba(124, 58, 237, 0.12)',
                color: '#6d28d9',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                lineHeight: 1.1,
                fontSize: { xs: '2.1rem', md: '3.25rem' },
              }}
            >
              Smarter prep for placements.
              <Box component="span" sx={{ display: 'block', color: '#667eea' }}>
                Better outcomes for students.
              </Box>
            </Typography>

            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 680 }}>
              Analyze your readiness, discover skill gaps, and follow a step-by-step roadmap designed for your
              dream role and placement season.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/login')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
              {stats.map((item) => (
                <Paper
                  key={item.label}
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    border: '1px solid rgba(2,132,199,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              sx={{
                borderRadius: 4,
                p: 1,
                border: '1px solid rgba(124,58,237,0.2)',
                background: 'linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(248,245,255,0.9) 100%)',
              }}
            >
              <CardContent>
                <Typography variant="overline" sx={{ letterSpacing: 1.3, color: '#6d28d9', fontWeight: 700 }}>
                  Journey
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                  Three-step placement flow
                </Typography>

                <Stack spacing={2}>
                  {steps.map((step, index) => (
                    <Stack key={step.title} direction="row" spacing={1.5} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 14,
                          backgroundColor: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                          {step.icon}
                          <Typography fontWeight={700}>{step.title}</Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {step.detail}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>

                <Box
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    p: 1.5,
                    backgroundColor: 'rgba(34,197,94,0.10)',
                    border: '1px dashed rgba(22,163,74,0.4)',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle sx={{ color: '#15803d', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>
                      Start from login/signup and continue to profile, dashboard, and analytics.
                    </Typography>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 7, md: 9 } }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mb: 1, fontSize: { xs: '1.6rem', md: '2.1rem' }, textAlign: { xs: 'left', md: 'center' } }}
          >
            Everything needed for placement season
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, textAlign: { xs: 'left', md: 'center' } }}>
            Purpose-built modules that convert preparation effort into interview confidence.
          </Typography>

          <Grid container spacing={3}>
            {featureCards.map((feature) => (
              <Grid item key={feature.title} xs={12} sm={6}>
                <Card
                  sx={{
                    height: '100%',
                    border: '1px solid rgba(124,58,237,0.14)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <CardContent sx={{ p: 3.5 }}>
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 2,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        color: '#6d28d9',
                        backgroundColor: 'rgba(124,58,237,0.12)',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">{feature.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 7, pt: 3, borderTop: '1px solid rgba(15,23,42,0.08)' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary">
              Placement Pilot - AI-powered readiness platform for student placements.
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
