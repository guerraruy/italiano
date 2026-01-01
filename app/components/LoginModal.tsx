'use client';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginModal() {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    login(username.trim());
  };

  return (
    <Dialog 
      open={!isAuthenticated} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Typography variant="h5" component="div" fontWeight="bold" textAlign="center">
          Welcome to Italiano
        </Typography>
      </DialogTitle>
      <Divider />
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
            <Typography variant="body1" color="text.secondary" textAlign="center">
              Please login to continue
            </Typography>
            
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error}
              autoFocus
              required
            />
            
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Password validation is not enabled yet"
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            size="large"
          >
            Login
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

