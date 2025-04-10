import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Paper, TextField, Button, Avatar, Grid, Divider, Alert, CircularProgress, Tabs, Tab } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, Notifications as NotificationsIcon, Person as PersonIcon, Assessment as AssessmentIcon } from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useUser } from '../context/UserContext';
import Navbar from '../components/navbar';
import EmailPreferences from '../components/EmailPreferences';

// Create dark theme for Profile page
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const Profile = () => {
  const { user, updateProfile, loading } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.fullname?.firstname || '',
        lastname: user.fullname?.lastname || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    
    try {
      await updateProfile({
        fullname: {
          firstname: formData.firstname,
          lastname: formData.lastname
        },
        email: formData.email
      });
      
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setEditMode(false);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to update profile' 
      });
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (user) {
      setFormData({
        firstname: user.fullname?.firstname || '',
        lastname: user.fullname?.lastname || '',
        email: user.email || '',
      });
    }
    setStatus({ type: '', message: '' });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <ThemeProvider theme={darkTheme}>
        <Navbar />
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: 'background.default'
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Navbar />
      <Box sx={{ backgroundColor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4 }}>
        <Container maxWidth="md">
          <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 600, mb: 3 }}>
            My Profile
          </Typography>
          
          {status.message && (
            <Alert 
              severity={status.type} 
              sx={{ mb: 3, borderRadius: 2 }}
            >
              {status.message}
            </Alert>
          )}
          
          <Paper elevation={0} sx={{ mb: 4 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  py: 2
                }
              }}
            >
              <Tab icon={<PersonIcon />} label="Personal Info" />
              <Tab icon={<AssessmentIcon />} label="Carbon Footprint" />
              <Tab icon={<NotificationsIcon />} label="Email Preferences" />
            </Tabs>
            
            {activeTab === 0 && (
              <Box sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        bgcolor: 'primary.main',
                        fontSize: '3rem',
                        mb: 2,
                        boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      {user?.fullname?.firstname?.charAt(0) || ''}
                    </Avatar>
                    
                    {!editMode && (
                      <Button 
                        variant="outlined" 
                        startIcon={<EditIcon />} 
                        onClick={() => setEditMode(true)}
                        sx={{ mt: 2 }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 500 }}>
                            Personal Information
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            disabled={!editMode}
                            required
                          />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            disabled={!editMode}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!editMode}
                            required
                          />
                        </Grid>
                        
                        {editMode && (
                          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button 
                              variant="outlined" 
                              color="inherit"
                              startIcon={<CancelIcon />}
                              onClick={handleCancel}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit"
                              variant="contained" 
                              color="primary"
                              startIcon={<SaveIcon />}
                            >
                              Save Changes
                            </Button>
                          </Grid>
                        )}
                      </Grid>
                    </form>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 500 }}>
                  Carbon Footprint Overview
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                        Total Footprint Reduction
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        23.5 kg CO2
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                        Completed Challenges
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        5
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => window.location.href = '/analytics'}
                      sx={{ mt: 2 }}
                    >
                      View Detailed Analytics
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeTab === 2 && (
              <Box sx={{ p: 4 }}>
                <EmailPreferences />
              </Box>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Profile; 