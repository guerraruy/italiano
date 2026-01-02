'use client';
import { Container, Typography, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import TranslateIcon from '@mui/icons-material/Translate';

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

export default function WordsTranslationsPage() {
  return (
    <PageContainer maxWidth="lg">
      <HeaderBox>
        <TranslateIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h3" component="h1" fontWeight="bold">
          Words Translations
        </Typography>
      </HeaderBox>
      
      <ContentPaper elevation={3}>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          This section will contain word translations and vocabulary exercises.
        </Typography>
      </ContentPaper>
    </PageContainer>
  );
}


