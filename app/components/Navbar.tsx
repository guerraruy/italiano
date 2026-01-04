'use client'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import TranslateIcon from '@mui/icons-material/Translate'
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver'
import ScheduleIcon from '@mui/icons-material/Schedule'
import MenuIcon from '@mui/icons-material/Menu'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import { useState, useSyncExternalStore } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import SettingsModal from './SettingsModal'
import UserMenu from './UserMenu'
import { useAuth } from '../contexts/AuthContext'

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  {
    text: 'Nouns Translations',
    icon: <TranslateIcon />,
    path: '/words-translations',
  },
  {
    text: 'Verbs Translations',
    icon: <RecordVoiceOverIcon />,
    path: '/verbs-translations',
  },
  { text: 'Verb Tenses', icon: <ScheduleIcon />, path: '/verb-tenses' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user } = useAuth()

  // Prevent hydration mismatch by only using dynamic values after mount
  const mounted = useSyncExternalStore(
    () => () => {}, // subscribe (no-op, value never changes after mount)
    () => true, // getSnapshot (client-side: always true)
    () => false // getServerSnapshot (server-side: always false)
  )

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleSettingsOpen = () => {
    setSettingsOpen(true)
  }

  const handleSettingsClose = () => {
    setSettingsOpen(false)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    if (isMobile) {
      setMobileOpen(false)
    }
  }

  const drawer = (
    <Box sx={{ width: 250 }} role='presentation'>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={pathname === item.path}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.path ? 'primary.main' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        {mounted && user?.admin && (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleNavigation('/admin')}
              selected={pathname === '/admin'}
            >
              <ListItemIcon
                sx={{
                  color: pathname === '/admin' ? 'primary.main' : 'inherit',
                }}
              >
                <AdminPanelSettingsIcon />
              </ListItemIcon>
              <ListItemText primary='Admin Panel' />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  )

  // Use mounted state to prevent hydration mismatch
  const showMobileMenu = mounted && isMobile
  const showDesktopMenu = mounted && !isMobile

  return (
    <>
      <AppBar
        position='sticky'
        elevation={2}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        <Container maxWidth='xl'>
          <Toolbar disableGutters>
            {showMobileMenu && (
              <IconButton
                color='inherit'
                aria-label='open drawer'
                edge='start'
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant='h6'
              noWrap
              component='div'
              sx={{
                flexGrow: showMobileMenu ? 1 : 0,
                mr: 4,
                fontWeight: 700,
                letterSpacing: '.1rem',
              }}
            >
              ITALIANO
            </Typography>

            {showDesktopMenu && (
              <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    onClick={() => handleNavigation(item.path)}
                    startIcon={item.icon}
                    sx={{
                      color: 'white',
                      backgroundColor:
                        pathname === item.path
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
                {mounted && user?.admin && (
                  <Button
                    onClick={() => handleNavigation('/admin')}
                    startIcon={<AdminPanelSettingsIcon />}
                    sx={{
                      color: 'white',
                      backgroundColor:
                        pathname === '/admin'
                          ? 'rgba(255, 255, 255, 0.15)'
                          : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                      },
                    }}
                  >
                    Admin Panel
                  </Button>
                )}
              </Box>
            )}

            <UserMenu onSettingsClick={handleSettingsOpen} />
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant='temporary'
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

      <SettingsModal open={settingsOpen} onClose={handleSettingsClose} />
    </>
  )
}
