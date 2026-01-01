'use client';
import { Container, Typography, Button, Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  textAlign: 'center',
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const HeroBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  minHeight: '60vh',
  justifyContent: 'center',
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '4rem',
  marginBottom: theme.spacing(2),
}));

export default function Home() {
  return (
    <Container maxWidth="md">
      <HeroBox>
        <IconWrapper>
          <MenuBookIcon fontSize="inherit" />
        </IconWrapper>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          Welcome to Italiano
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Your journey to learning Italian starts here
        </Typography>
        <StyledPaper elevation={3}>
          <Typography variant="body1" paragraph>
            This is a modern Next.js application built with:
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            ✓ Next.js 15 (App Router)
            <br />
            ✓ TypeScript
            <br />
            ✓ Material-UI (MUI)
            <br />
            ✓ @emotion/styled for styled components
            <br />
            ✓ PostgreSQL with Prisma ORM
          </Typography>
        </StyledPaper>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="contained" size="large" color="primary">
            Get Started
          </Button>
          <Button variant="outlined" size="large" color="primary">
            Learn More
          </Button>
        </Box>
      </HeroBox>
    </Container>
  );
}

