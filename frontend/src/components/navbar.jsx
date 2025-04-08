"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  alpha,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  EmojiEvents as ContestsIcon,
  Info as AboutIcon,
  Calculate as CalculatorIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Create a dark theme for the navbar
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = darkTheme; // Use dark theme directly
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  const menuItems = [
    { text: 'DASHBOARD', icon: <DashboardIcon />, path: '/home', color: 'inherit' },
    { text: 'ANALYTICS', icon: <AnalyticsIcon />, path: '/analytics', color: 'primary' },
    { text: 'COMMUNITY', icon: <PeopleIcon />, path: '/community', color: 'inherit' },
    { text: 'CONTESTS', icon: <ContestsIcon />, path: '/contests', color: 'inherit' },
    { text: 'ABOUT US', icon: <AboutIcon />, path: '/', color: 'inherit' },
  ];

  const drawer = (
    <Box sx={{ width: '100%' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            component={Link} 
            to={item.path}
            sx={{
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
          >
            <ListItemIcon sx={{ color: item.color }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem 
          onClick={handleLogout}
          sx={{
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.1),
            },
            cursor: 'pointer'
          }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="LOGOUT" sx={{ color: 'error.main' }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar 
        position="sticky" 
        sx={{ 
          bgcolor: 'background.paper',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img
              src="https://media.istockphoto.com/id/1401304047/vector/reduce-your-carbon-footprint-logo-net-zero-emission.jpg?s=612x612&w=0&k=20&c=xub0yqSnVW4NN827DP0k7VPy5Gc3SSZ-4PbgITJbKVo="
              alt="Logo"
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>

          {isMobile ? (
            <IconButton
              color="inherit"
              edge="end"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ color: 'text.primary' }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: item.color,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
              <Button
                variant="contained"
                color="primary"
                startIcon={<CalculatorIcon />}
                onClick={() => navigate("/calculator")}
                sx={{
                  boxShadow: '0 4px 14px rgba(76, 175, 80, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
                  }
                }}
              >
                CALCULATE FOOTPRINT
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                sx={{
                  boxShadow: '0 4px 14px rgba(244, 67, 54, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(244, 67, 54, 0.4)',
                  }
                }}
              >
                LOGOUT
              </Button>
            </Box>
          )}
        </Toolbar>

        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              width: 280,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            }
          }}
        >
          {drawer}
        </Drawer>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
