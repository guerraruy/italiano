'use client';
import { Container, Typography, Button, Box, Paper, Card, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import TranslateIcon from '@mui/icons-material/Translate';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { useRouter } from 'next/navigation';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeroSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(6),
  textAlign: 'center',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '4rem',
  marginBottom: theme.spacing(2),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '3rem',
  marginBottom: theme.spacing(2),
}));

export default function Home() {
  const router = useRouter();

  const features = [
    {
      title: 'Words Translations',
      description: 'Learn and practice Italian vocabulary with interactive translations',
      icon: <TranslateIcon fontSize="inherit" />,
      path: '/words-translations',
    },
    {
      title: 'Verbs Translations',
      description: 'Master Italian verbs with comprehensive translation exercises',
      icon: <RecordVoiceOverIcon fontSize="inherit" />,
      path: '/verbs-translations',
    },
    {
      title: 'Verb Tenses',
      description: 'Practice verb conjugations across different tenses',
      icon: <ScheduleIcon fontSize="inherit" />,
      path: '/verb-tenses',
    },
  ];

  return (
    <PageContainer maxWidth="lg">
      <HeroSection>
        <IconWrapper>
          <HomeIcon fontSize="inherit" />
        </IconWrapper>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Welcome to Italiano
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your journey to learning Italian starts here
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth="md">
          Choose a learning path below to begin mastering the Italian language with interactive exercises and comprehensive lessons.
        </Typography>
      </HeroSection>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>
        {features.map((feature) => (
          <Box key={feature.title}>
            <FeatureCard 
              elevation={3}
              onClick={() => router.push(feature.path)}
            >
              <CardContent sx={{ textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
                <FeatureIcon>
                  {feature.icon}
                </FeatureIcon>
                <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </FeatureCard>
          </Box>
        ))}
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          mt: 6, 
          p: 4, 
          textAlign: 'center',
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Ready to start learning?
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Click on any of the cards above to begin your Italian learning journey
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mt: 3 }}>
          <Button variant="contained" size="large" color="primary" onClick={() => router.push('/words-translations')}>
            Get Started
          </Button>
        </Box>
      </Paper>
    </PageContainer>
  );
}

