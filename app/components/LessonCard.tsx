'use client';
import { styled } from '@mui/material/styles';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';

// Example of using @emotion/styled with MUI
const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  margin: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const LevelChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  textTransform: 'uppercase',
  fontSize: '0.75rem',
}));

const VocabBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[50],
  marginTop: theme.spacing(1),
}));

interface LessonCardProps {
  title: string;
  description?: string;
  level: string;
  vocabularyCount?: number;
}

export default function LessonCard({ 
  title, 
  description, 
  level,
  vocabularyCount = 0 
}: LessonCardProps) {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <StyledCard elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" fontWeight="bold">
            {title}
          </Typography>
          <LevelChip 
            label={level} 
            color={getLevelColor(level)} 
            size="small" 
          />
        </Box>
        
        {description && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {description}
          </Typography>
        )}
        
        <VocabBox>
          <Typography variant="body2" fontWeight="medium">
            Vocabulary Words:
          </Typography>
          <Typography variant="body2" color="primary.main" fontWeight="bold">
            {vocabularyCount}
          </Typography>
        </VocabBox>
      </CardContent>
    </StyledCard>
  );
}

