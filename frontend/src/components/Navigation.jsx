import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CalculateIcon from '@mui/icons-material/Calculate';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

const Navigation = ({ open, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250 }} role="presentation">
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="div">
            Carbon Footprint
          </Typography>
        </Box>
        <Divider />
        <List>
          <ListItem button component={Link} to="/" onClick={onClose}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          <ListItem button component={Link} to="/calculator" onClick={onClose}>
            <ListItemIcon>
              <CalculateIcon />
            </ListItemIcon>
            <ListItemText primary="Calculator" />
          </ListItem>

          <ListItem button component={Link} to="/analytics" onClick={onClose}>
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItem>

          <ListItem button component={Link} to="/community" onClick={onClose}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Community" />
          </ListItem>

          <ListItem button component={Link} to="/about" onClick={onClose}>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="About" />
          </ListItem>
        </List>
        <Divider />
        <List>
          {user ? (
            <>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary={user.username} />
              </ListItem>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <ListItem button component={Link} to="/login" onClick={onClose}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

export default Navigation; 