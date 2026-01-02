'use client';
import { Container, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ScheduleIcon from '@mui/icons-material/Schedule';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const ContentPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: '400px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

export default function VerbTensesPage() {
  return (
    <PageContainer maxWidth="lg">
      <HeaderBox>
        <ScheduleIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h3" component="h1" fontWeight="bold">
          Verb Tenses
        </Typography>
      </HeaderBox>
      
      <ContentPaper elevation={3}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          This section will contain verb tense exercises and grammar lessons.
        </Typography>
      </ContentPaper>
    </PageContainer>
  );
}


