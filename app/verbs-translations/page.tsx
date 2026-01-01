'use client';
import { Container, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

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

export default function VerbsTranslationsPage() {
  return (
    <PageContainer maxWidth="lg">
      <HeaderBox>
        <RecordVoiceOverIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h3" component="h1" fontWeight="bold">
          Verbs Translations
        </Typography>
      </HeaderBox>
      
      <ContentPaper elevation={3}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          This section will contain verb translations and conjugation exercises.
        </Typography>
      </ContentPaper>
    </PageContainer>
  );
}

