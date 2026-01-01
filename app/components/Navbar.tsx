'use client';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, useTheme, useMediaQuery } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import TranslateIcon from '@mui/icons-material/Translate';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Words Translations', icon: <TranslateIcon />, path: '/words-translations' },
  { text: 'Verbs Translations', icon: <RecordVoiceOverIcon />, path: '/verbs-translations' },
  { text: 'Verb Tenses', icon: <ScheduleIcon />, path: '/verb-tenses' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => handleNavigation(item.path)}
              selected={pathname === item.path}
            >
              <ListItemIcon sx={{ color: pathname === item.path ? 'primary.main' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                flexGrow: isMobile ? 1 : 0,
                mr: 4,
                fontWeight: 700,
                letterSpacing: '.1rem',
              }}
            >
              ITALIANO
            </Typography>

            {!isMobile && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: 'white',
                      backgroundColor: pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

